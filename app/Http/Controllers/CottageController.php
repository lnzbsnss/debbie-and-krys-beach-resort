<?php

namespace App\Http\Controllers;

use App\Models\Cottage;
use App\Http\Requests\StoreCottageRequest;
use App\Http\Requests\UpdateCottageRequest;
use App\Traits\HandlesImageUpload;
use Illuminate\Http\Request;

class CottageController extends Controller
{
    use HandlesImageUpload;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (!auth()->user()->can('global access') && !auth()->user()->can('cottage access')) {
                abort(403, 'Unauthorized');
            }
            return $next($request);
        });
    }

    public function index(Request $request)
    {
        $query = Cottage::query();

        // Apply search if provided
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply column filters
        if ($request->filled('filters')) {
            $filters = $request->filters;

            if (isset($filters['size']) && !empty($filters['size'])) {
                $sizeFilters = is_array($filters['size']) ? $filters['size'] : [$filters['size']];
                $query->whereIn('size', $sizeFilters);
            }

            if (isset($filters['is_active']) && !empty($filters['is_active'])) {
                $statusFilters = is_array($filters['is_active'])
                    ? $filters['is_active']
                    : explode(',', $filters['is_active']);

                $query->where(function ($q) use ($statusFilters) {
                    foreach ($statusFilters as $status) {
                        if ($status === 'active') {
                            $q->orWhere('is_active', true);
                        } elseif ($status === 'inactive') {
                            $q->orWhere('is_active', false);
                        }
                    }
                });
            }
        }

        // Apply sorting with validation
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        $allowedSortFields = [
            'name',
            'size',
            'max_pax',
            'day_tour_price',
            'overnight_price',
            'quantity',
            'created_at',
            'updated_at',
        ];

        if (!in_array($sortField, $allowedSortFields) || !is_string($sortField)) {
            $sortField = 'created_at';
        }

        $sortDirection = in_array($sortDirection, ['asc', 'desc']) ? $sortDirection : 'desc';
        $query->orderBy($sortField, $sortDirection);

        $perPage = $request->get('per_page', 10);
        $cottages = $query->paginate($perPage)->withQueryString();

        // Transform data
        $transformedCottages = $cottages->through(function ($cottage) {
            return [
                'id' => $cottage->id,
                'name' => $cottage->name,
                'size' => $cottage->size,
                'size_label' => ucfirst($cottage->size),
                'description' => $cottage->description,
                'max_pax' => $cottage->max_pax,
                'day_tour_price' => $cottage->day_tour_price,
                'formatted_day_tour_price' => number_format($cottage->day_tour_price, 2),
                'overnight_price' => $cottage->overnight_price,
                'formatted_overnight_price' => number_format($cottage->overnight_price, 2),
                'quantity' => $cottage->quantity,
                'images' => $cottage->images,
                'is_active' => $cottage->is_active,
                'status_label' => $cottage->is_active ? 'Active' : 'Inactive',
                'created_at' => $cottage->created_at->format('M d, Y'),
                'updated_at' => $cottage->updated_at->format('M d, Y'),
            ];
        });

        $filterOptions = $this->getFilterOptions();

        return inertia('cottages/index', [
            'cottages' => $transformedCottages,
            'filterOptions' => $filterOptions,
            'queryParams' => $request->only(['search', 'sort', 'direction', 'per_page', 'filters']),
        ]);
    }

    private function getFilterOptions()
    {
        return [
            'size' => [
                ['value' => 'big', 'label' => 'Big'],
                ['value' => 'small', 'label' => 'Small'],
            ],
            'is_active' => [
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'inactive', 'label' => 'Inactive'],
            ],
        ];
    }

    public function store(StoreCottageRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('images')) {
            $data['images'] = $this->uploadImages($request->file('images'), 'cottages');
        }

        Cottage::create($data);

        return redirect()->route('cottages.index')
            ->with('success', 'Cottage created successfully');
    }

    public function update(UpdateCottageRequest $request, Cottage $cottage)
    {
        $data = $request->validated();

        $existingImages = $request->input('existing_images', []);
        $newImages = [];

        if ($request->hasFile('images')) {
            $newImages = $this->uploadImages($request->file('images'), 'cottages');
        }

        $data['images'] = array_merge($existingImages, $newImages);

        if ($cottage->images) {
            $removedImages = array_diff($cottage->images, $existingImages);
            if (!empty($removedImages)) {
                $this->deleteImages($removedImages);
            }
        }

        $cottage->update($data);

        return redirect()->route('cottages.index')
            ->with('success', 'Cottage updated successfully');
    }

    public function destroy(Cottage $cottage)
    {
        if ($cottage->images) {
            $this->deleteImages($cottage->images);
        }

        $cottage->delete();

        return redirect()->route('cottages.index')
            ->with('success', 'Cottage deleted successfully');
    }
}
