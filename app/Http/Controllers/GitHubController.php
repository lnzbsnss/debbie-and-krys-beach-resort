<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class GitHubController extends Controller
{
    public function getUpdates()
    {
        try {
            $owner = config('services.github.repo_owner');
            $repo = config('services.github.repo_name');
            $token = config('services.github.access_token');

            // Skip cache for admins or add ?refresh=1 parameter
            $cacheKey = "github_updates_{$owner}_{$repo}";
            $cacheDuration = 120;

            if (request()->has('refresh') && auth()->user()?->hasRole('Admin')) {
                Cache::forget($cacheKey);
            }

            return Cache::remember($cacheKey, $cacheDuration, function () use ($owner, $repo, $token) {
                $response = Http::withOptions([
                    'verify' => config('services.github.verify_ssl', !app()->isLocal()),
                ])
                ->withHeaders([
                    'Accept' => 'application/vnd.github+json',
                    'Authorization' => "Bearer {$token}",
                    'X-GitHub-Api-Version' => '2022-11-28',
                    'User-Agent' => 'Laravel-App'
                ])->get("https://api.github.com/repos/{$owner}/{$repo}/releases", [
                    'per_page' => 10,
                    'page' => 1
                ]);

                if ($response->successful()) {
                    $releases = $response->json();

                    $updates = collect($releases)
                        ->filter(function ($release) {
                            return !$release['draft'];
                        })
                        ->take(3)
                        ->map(function ($release) {
                            return [
                                'version' => $release['tag_name'],
                                'date' => date('Y-m-d', strtotime($release['published_at'])),
                                'type' => $this->determineType($release['tag_name'], $release['prerelease']),
                                'title' => $release['name'] ?: $release['tag_name'],
                                'description' => $this->extractDescription($release['body']),
                                'changes' => $this->parseChanges($release['body']),
                                'html_url' => $release['html_url'],
                                'author' => $release['author']['login'] ?? 'Unknown'
                            ];
                        })
                        ->values();

                    return response()->json($updates);
                }

                return response()->json(['error' => 'Failed to fetch updates'], 500);
            });

        } catch (\Exception $e) {
            Log::error('GitHub API Error: ' . $e->getMessage());
            return response()->json(['error' => 'Unable to connect to GitHub'], 500);
        }
    }

    private function determineType($tagName, $isPrerelease)
    {
        if ($isPrerelease) return 'prerelease';

        if (strpos($tagName, 'v') === 0) {
            $version = ltrim($tagName, 'v');
            $parts = explode('.', $version);

            if (count($parts) >= 3) {
                if ($parts[1] === '0' && $parts[2] === '0') return 'major';
                if ($parts[2] === '0') return 'minor';
                return 'patch';
            }
        }
        return 'release';
    }

    private function extractDescription($body)
    {
        if (!$body) return 'Release notes available on GitHub';

        $lines = explode("\n", trim($body));
        $description = '';

        foreach ($lines as $line) {
            $line = trim($line);
            // Skip empty lines and markdown headers
            if (empty($line) || preg_match('/^#+\s/', $line)) {
                continue;
            }
            // If we hit a bullet point without finding description, return default
            if (preg_match('/^[-*+]\s/', $line) || preg_match('/^\d+\.\s/', $line)) {
                break;
            }
            // Found a description line
            $description = strlen($line) > 100 ? substr($line, 0, 97) . '...' : $line;
            break;
        }

        return $description ?: 'Release notes available on GitHub';
    }

    private function parseChanges($body)
    {
        if (!$body) return [['text' => 'View release notes on GitHub', 'type' => 'item']];

        $changes = [];
        $lines = explode("\n", $body);

        foreach ($lines as $line) {
            $line = trim($line);

            // Match headers
            if (preg_match('/^#+\s+(.+)/', $line, $matches)) {
                $changes[] = ['text' => trim($matches[1]), 'type' => 'header'];
            }
            // Match bullet points
            elseif (preg_match('/^[-*+]\s+(.+)/', $line, $matches)) {
                $changes[] = ['text' => trim($matches[1]), 'type' => 'item'];
            }
        }

        return array_slice($changes, 0, 10) ?: [['text' => 'View full release notes on GitHub', 'type' => 'item']];
    }
}
