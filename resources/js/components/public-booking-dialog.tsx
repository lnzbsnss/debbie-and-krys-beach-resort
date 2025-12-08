// resources/js/components/public-booking-dialog.tsx

import { useState, useMemo, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isBefore, startOfDay } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Hotel, Users, User, LoaderCircle, Check, ChevronLeft, ChevronRight, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PasswordInput } from '@/components/password-input';
import PasswordRequirements, { validatePassword } from '@/components/password-requirements';
import { useRecaptcha } from '@/hooks/use-recaptcha';
import { toast } from 'sonner'; // ADD THIS IMPORT
import type { PageProps } from '@/types';
import type { AccommodationWithAvailability } from '@/types/calendar';

import { usePhilippinesLocations } from '@/hooks/use-philippines-locations';
import { LocationSelect } from '@/components/location-select';

interface PublicBookingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface MonthAvailability {
    [date: string]: {
        available: number;
        total: number;
        status: 'full' | 'available' | 'partial';
    };
}

export function PublicBookingDialog({ open, onOpenChange }: PublicBookingDialogProps) {
    const { auth } = usePage<PageProps>().props;
    const [currentTab, setCurrentTab] = useState('availability');
    const [selectedDate, setSelectedDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
    const [calendarDate, setCalendarDate] = useState(addDays(new Date(), 1));
    const [bookingType, setBookingType] = useState<'day_tour' | 'overnight'>('day_tour');
    const [selectedAccommodations, setSelectedAccommodations] = useState<{
        accommodation_id: number;
        accommodation_rate_id: number;
        guests: number;
    }[]>([]);
    const [availableAccommodations, setAvailableAccommodations] = useState<AccommodationWithAvailability[]>([]);
    const [monthAvailability, setMonthAvailability] = useState<MonthAvailability>({});
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [loadingMonth, setLoadingMonth] = useState(false);
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
    const { executeRecaptcha } = useRecaptcha();

    const minCheckInDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const today = startOfDay(new Date());

    const minCheckOutDate = useMemo(() => {
        if (selectedDate) {
            const checkIn = new Date(selectedDate);
            checkIn.setDate(checkIn.getDate() + 1);
            return format(checkIn, 'yyyy-MM-dd');
        }
        return minCheckInDate;
    }, [selectedDate, minCheckInDate]);

    const monthStart = startOfMonth(calendarDate);
    const monthEnd = endOfMonth(calendarDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const {
        selectedCountry,
        selectedProvince,
        selectedCity,
        addressLine,
        setAddressLine,
        handleCountryChange,
        handleProvinceChange,
        handleCityChange,
        countryOptions,
        provinceOptions,
        cityOptions,
        getFormattedAddress
    } = usePhilippinesLocations();

    // Booking form
    const bookingForm = useForm({
        // User authentication fields
        user_type: (auth.user ? 'registered' : 'guest') as 'guest' | 'register',
        register_name: '',
        register_email: '',
        register_phone: '',
        register_address: '',
        register_password: '',
        register_password_confirmation: '',

        // Booking fields
        source: (auth.user ? 'registered' : 'guest') as 'guest' | 'registered',
        booking_type: bookingType,
        guest_name: auth.user?.name || '',
        guest_email: auth.user?.email || '',
        guest_phone: auth.user?.phone || '',
        guest_address: auth.user?.address || '',
        check_in_date: selectedDate,
        check_out_date: '',
        total_adults: 1,
        total_children: 0,
        down_payment_required: false,
        down_payment_amount: '',
        notes: '',
        accommodations: [] as {
            accommodation_id: number;
            accommodation_rate_id: number;
            guests: number;
        }[],
    });

    // Password validation using bookingForm data
    const { isValid: isPasswordValid } = validatePassword(bookingForm.data.register_password);
    const isPasswordMatch = bookingForm.data.register_password === bookingForm.data.register_password_confirmation;

    // Load availability when date or booking type changes
    useEffect(() => {
        if (open) {
            loadAvailability();
        }
    }, [selectedDate, bookingType, open]);

    // Load month availability when calendar month changes
    useEffect(() => {
        if (open) {
            loadMonthAvailability();
        }
    }, [calendarDate, bookingType, open]);

    const loadAvailability = () => {
        setLoadingAvailability(true);

        fetch(`/api/availability?date=${selectedDate}&booking_type=${bookingType}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch availability');
                }
                return res.json();
            })
            .then(data => {
                setAvailableAccommodations(data.accommodations);
                setLoadingAvailability(false);
            })
            .catch(error => {
                console.error('Failed to load availability:', error);
                toast.error('Failed to load availability', {
                    description: 'Please try again or refresh the page.',
                });
                setLoadingAvailability(false);
            });
    };

    const loadMonthAvailability = () => {
        setLoadingMonth(true);
        const startDate = format(monthStart, 'yyyy-MM-dd');
        const endDate = format(monthEnd, 'yyyy-MM-dd');

        fetch(`/api/availability/month?start_date=${startDate}&end_date=${endDate}&booking_type=${bookingType}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch month availability');
                }
                return res.json();
            })
            .then(data => {
                setMonthAvailability(data.availability);
                setLoadingMonth(false);
            })
            .catch(error => {
                console.error('Failed to load month availability:', error);
                toast.error('Failed to load calendar availability', {
                    description: 'Please try selecting a different month.',
                });
                setLoadingMonth(false);
            });
    };

    const toggleAccommodationSelection = (accommodation: AccommodationWithAvailability) => {
        const isSelected = selectedAccommodations.some(a => a.accommodation_id === accommodation.id);

        if (isSelected) {
            setSelectedAccommodations([]);
            // Also clear from bookingForm
            bookingForm.setData('accommodations', []);
        } else {
            const rate = bookingType === 'day_tour' ? accommodation.day_tour_rate : accommodation.overnight_rate;
            if (rate && rate.id) {
                const totalGuests = bookingForm.data.total_adults + bookingForm.data.total_children;
                const newSelection = [{
                    accommodation_id: accommodation.id,
                    accommodation_rate_id: rate.id,
                    guests: totalGuests,
                }];

                setSelectedAccommodations(newSelection);
                // Also update bookingForm
                bookingForm.setData('accommodations', newSelection);
            }
        }
    };

    // guests count in selected accommodations when total guests change
    useEffect(() => {
        if (selectedAccommodations.length > 0) {
            const totalGuests = bookingForm.data.total_adults + bookingForm.data.total_children;
            const updatedAccommodations = selectedAccommodations.map(item => ({
                ...item,
                guests: totalGuests
            }));

            setSelectedAccommodations(updatedAccommodations);
            // Also update bookingForm
            bookingForm.setData('accommodations', updatedAccommodations);
        }
    }, [bookingForm.data.total_adults, bookingForm.data.total_children]);

    useEffect(() => {
        if (!auth.user) {
            const formattedAddress = getFormattedAddress();
            if (formattedAddress) {
                bookingForm.setData('guest_address', formattedAddress);
            }
        }
    }, [selectedCountry, selectedProvince, selectedCity, addressLine]);

    useEffect(() => {
        if (bookingForm.errors && Object.keys(bookingForm.errors).length > 0) {
            const errorMessages = Object.values(bookingForm.errors);

            if (errorMessages.length === 1) {
                toast.error(errorMessages[0] as string);
            } else {
                toast.error('Please fix the following errors:', {
                    description: (
                        <ul className="list-disc list-inside space-y-1 mt-2">
                            {errorMessages.map((error, index) => (
                                <li key={index}>{error as string}</li>
                            ))}
                        </ul>
                    ),
                });
            }
        }
    }, [bookingForm.errors]);

    const handleDateClick = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        setSelectedDate(dateStr);
        setSelectedAccommodations([]);
    };

    const handlePrevMonth = () => {
        setCalendarDate(subMonths(calendarDate, 1));
    };

    const handleNextMonth = () => {
        setCalendarDate(addMonths(calendarDate, 1));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'full':
                return 'bg-red-500';
            case 'partial':
                return 'bg-yellow-500';
            case 'available':
                return 'bg-green-500';
            default:
                return 'bg-gray-300';
        }
    };

    const getDayAvailability = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return monthAvailability[dateStr];
    };

    // Calculate booking summary
    const calculateBookingSummary = () => {
        let accommodationTotal = 0;
        let entranceFeeTotal = 0;
        let totalFreeEntrances = 0;

        let numberOfNights = 1;
        if (bookingType === 'overnight' && bookingForm.data.check_in_date && bookingForm.data.check_out_date) {
            const checkIn = new Date(bookingForm.data.check_in_date);
            const checkOut = new Date(bookingForm.data.check_out_date);
            const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
            numberOfNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        }

        selectedAccommodations.forEach(item => {
            const accommodation = availableAccommodations.find(a => a.id === item.accommodation_id);
            const rate = bookingType === 'day_tour' ? accommodation?.day_tour_rate : accommodation?.overnight_rate;

            if (accommodation && rate) {
                let baseRate = parseFloat(rate.rate.toString());
                if (bookingType === 'overnight') {
                    baseRate = baseRate * numberOfNights;
                }

                let subtotal = baseRate;

                const guestsNum = item.guests;
                if (accommodation.min_capacity && guestsNum > accommodation.min_capacity) {
                    const additionalGuests = guestsNum - accommodation.min_capacity;
                    let additionalPaxRate = rate.additional_pax_rate ? parseFloat(rate.additional_pax_rate.toString()) : 0;

                    if (bookingType === 'overnight') {
                        additionalPaxRate = additionalPaxRate * numberOfNights;
                    }

                    subtotal += additionalGuests * additionalPaxRate;
                }

                accommodationTotal += subtotal;

                if (rate.includes_free_entrance) {
                    totalFreeEntrances += Math.min(guestsNum, accommodation.min_capacity || 0);
                }
            }
        });

        const adultsNum = bookingForm.data.total_adults;
        const childrenNum = bookingForm.data.total_children;

        const adultsNeedingEntrance = Math.max(0, adultsNum - totalFreeEntrances);
        const childrenNeedingEntrance = childrenNum;

        const firstAccom = selectedAccommodations[0];
        if (firstAccom) {
            const accommodation = availableAccommodations.find(a => a.id === firstAccom.accommodation_id);
            const firstRate = bookingType === 'day_tour' ? accommodation?.day_tour_rate : accommodation?.overnight_rate;

            if (firstRate) {
                if (adultsNeedingEntrance > 0 && firstRate.adult_entrance_fee) {
                    entranceFeeTotal += adultsNeedingEntrance * parseFloat(firstRate.adult_entrance_fee.toString());
                }

                if (childrenNeedingEntrance > 0 && firstRate.child_entrance_fee) {
                    entranceFeeTotal += childrenNeedingEntrance * parseFloat(firstRate.child_entrance_fee.toString());
                }
            }
        }

        const totalAmount = accommodationTotal + entranceFeeTotal;

        return {
            numberOfNights,
            accommodationTotal,
            entranceFeeTotal,
            totalAmount,
            totalFreeEntrances,
        };
    };

    const summary = calculateBookingSummary();

    const handleAvailabilityNext = () => {
        if (selectedAccommodations.length === 0) return;

        bookingForm.setData({
            ...bookingForm.data,
            check_in_date: selectedDate,
            booking_type: bookingType,
            accommodations: selectedAccommodations,
        });

        setCurrentTab('details');
    };

    const handleDetailsNext = () => {
        if (auth.user) {
            bookingForm.setData('user_type', 'registered');
            submitBooking();
        } else {
            // Pre-fill register fields with guest details
            bookingForm.setData({
                ...bookingForm.data,
                register_name: bookingForm.data.guest_name,
                register_email: bookingForm.data.guest_email,
                register_phone: bookingForm.data.guest_phone,
                register_address: bookingForm.data.guest_address,
            });
            setCurrentTab('auth');
        }
    };

    const submitBooking = () => {
        if (!auth.user) {
            bookingForm.setData('user_type', 'register');
        }

        bookingForm.post('/bookings/public', {
            onSuccess: () => {
                toast.success('Booking created successfully!', {
                    description: 'Please check your email for confirmation.',
                });
                onOpenChange(false);
                setCurrentTab('availability');
                setSelectedAccommodations([]);
            },
        });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isPasswordValid || !isPasswordMatch) {
            toast.error('Please fix the form errors before submitting.');
            return;
        }

        try {
            const token = await executeRecaptcha('register');
            if (!token) {
                toast.error('reCAPTCHA verification failed. Please try again.');
                return;
            }

            // Set recaptcha token and prefill guest fields with register data
            bookingForm.setData({
                ...bookingForm.data,
                guest_name: bookingForm.data.register_name,
                guest_email: bookingForm.data.register_email,
                guest_phone: bookingForm.data.register_phone || '',
                guest_address: bookingForm.data.register_address || '',
            });

            submitBooking();
        } catch (error) {
            toast.error('Registration failed. Please try again.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] lg:max-w-[1400px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Book Your Stay</DialogTitle>
                    <DialogDescription>
                        Select your dates and accommodations to reserve your perfect getaway
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={currentTab} onValueChange={setCurrentTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="availability" className="gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="hidden sm:inline">Availability</span>
                            <span className="sm:hidden">Dates</span>
                        </TabsTrigger>
                        <TabsTrigger value="details" disabled={selectedAccommodations.length === 0} className="gap-2">
                            <Hotel className="h-4 w-4" />
                            <span className="hidden sm:inline">Details</span>
                        </TabsTrigger>
                        <TabsTrigger value="summary" disabled={selectedAccommodations.length === 0} className="gap-2">
                            <Receipt className="h-4 w-4" />
                            <span className="hidden sm:inline">Summary</span>
                        </TabsTrigger>
                        <TabsTrigger value="auth" disabled={!auth.user && currentTab !== 'auth'} className="gap-2">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                {auth.user ? 'Confirm' : 'Account'}
                            </span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Step 1: Check Availability */}
                    <TabsContent value="availability" className="space-y-4 mt-6">
                        <div className="grid gap-4 lg:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="booking_type">Booking Type</Label>
                                <Select
                                    value={bookingType}
                                    onValueChange={(value: 'day_tour' | 'overnight') => {
                                        setBookingType(value);
                                        setSelectedAccommodations([]);
                                    }}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="day_tour">Day Tour (6AM - 6PM)</SelectItem>
                                        <SelectItem value="overnight">Overnight (6AM - 6AM next day)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end gap-2">
                                {selectedAccommodations.length > 0 && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedAccommodations([])}
                                        className="flex-1"
                                    >
                                        Clear Selection
                                    </Button>
                                )}
                                <Button
                                    onClick={handleAvailabilityNext}
                                    disabled={selectedAccommodations.length === 0}
                                    className="flex-1"
                                >
                                    Continue to Details
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                            {/* Calendar */}
                            <Card className="h-fit">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base font-medium">
                                            {format(calendarDate, 'MMMM yyyy')}
                                        </CardTitle>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={handlePrevMonth}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={handleNextMonth}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                            <div key={i} className="font-medium text-muted-foreground py-2">
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-1">
                                        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                                            <div key={`empty-${i}`} className="aspect-square" />
                                        ))}
                                        {monthDays.map((day) => {
                                            const dayAvailability = getDayAvailability(day);
                                            const isSelected = isSameDay(day, new Date(selectedDate));
                                            const isToday = isSameDay(day, today);
                                            const isPast = isBefore(day, today);
                                            const isTodayOrPast = isPast || isToday;
                                            const isDisabled = isTodayOrPast;

                                            return (
                                                <button
                                                    key={day.toISOString()}
                                                    onClick={() => !isDisabled && handleDateClick(day)}
                                                    disabled={isDisabled}
                                                    className={cn(
                                                        'aspect-square p-2 text-sm rounded-md relative hover:bg-muted transition-colors font-medium',
                                                        isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
                                                        isToday && !isSelected && 'border-2 border-primary',
                                                        isDisabled && 'opacity-30 cursor-not-allowed hover:bg-transparent'
                                                    )}
                                                >
                                                    <div className="flex flex-col items-center justify-center h-full">
                                                        <span>{format(day, 'd')}</span>
                                                        {dayAvailability && !isDisabled && (
                                                            <div
                                                                className={cn(
                                                                    'w-1.5 h-1.5 rounded-full mt-1',
                                                                    getStatusColor(dayAvailability.status)
                                                                )}
                                                            />
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 space-y-2 text-xs border-t pt-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500" />
                                            <span>All Available</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                            <span>Partially Available</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500" />
                                            <span>Fully Booked</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Accommodations List */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            {format(new Date(selectedDate), 'EEEE, MMMM dd, yyyy')}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-0.5">
                                            {bookingType === 'day_tour' ? '6:00 AM - 6:00 PM' : '6:00 AM - 6:00 AM (next day)'}
                                        </p>
                                    </div>
                                    {selectedAccommodations.length > 0 && (
                                        <Badge variant="secondary" className="text-sm">
                                            {selectedAccommodations.length} selected
                                        </Badge>
                                    )}
                                </div>

                                {loadingAvailability ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="text-center">
                                            <LoaderCircle className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                                            <p className="text-sm text-muted-foreground">Loading accommodations...</p>
                                        </div>
                                    </div>
                                ) : availableAccommodations.length === 0 ? (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center py-20">
                                            <Hotel className="h-16 w-16 text-muted-foreground mb-4" />
                                            <h4 className="font-semibold text-lg mb-2">No Accommodations Available</h4>
                                            <p className="text-sm text-muted-foreground text-center max-w-md">
                                                All accommodations are booked for {format(new Date(selectedDate), 'MMMM dd, yyyy')}.
                                                <br />
                                                Please select another date from the calendar.
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
                                        {availableAccommodations.map((accommodation) => {
                                            const isAvailable = bookingType === 'day_tour'
                                                ? accommodation.day_tour_available
                                                : accommodation.overnight_available;
                                            const rate = bookingType === 'day_tour'
                                                ? accommodation.day_tour_rate
                                                : accommodation.overnight_rate;
                                            const isSelected = selectedAccommodations.some(a => a.accommodation_id === accommodation.id);

                                            return (
                                                <Card
                                                    key={accommodation.id}
                                                    className={cn(
                                                        "cursor-pointer transition-all hover:shadow-md",
                                                        isSelected && "ring-2 ring-primary shadow-md",
                                                        !isAvailable && "opacity-50 cursor-not-allowed"
                                                    )}
                                                    onClick={() => isAvailable && toggleAccommodationSelection(accommodation)}
                                                >
                                                    <CardContent className="p-5">
                                                        <div className="flex gap-4">
                                                            {accommodation.first_image_url ? (
                                                                <img
                                                                    src={accommodation.first_image_url}
                                                                    alt={accommodation.name}
                                                                    className="h-24 w-24 rounded-lg object-cover shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                                    <Hotel className="h-12 w-12 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-bold text-lg truncate">{accommodation.name}</p>
                                                                        <p className="text-sm text-muted-foreground mt-1">
                                                                            <Users className="h-3.5 w-3.5 inline mr-1.5" />
                                                                            {accommodation.min_capacity}-{accommodation.max_capacity} guests
                                                                        </p>
                                                                    </div>
                                                                    {isSelected && (
                                                                        <div className="shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                                                                            <Check className="h-4 w-4 text-primary-foreground" />
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                                    <Badge variant="outline" className="text-xs font-medium">
                                                                        {accommodation.type === 'room' ? 'Room' : 'Cottage'}
                                                                    </Badge>
                                                                    <Badge variant="outline" className="text-xs font-medium">
                                                                        {accommodation.size === 'small' ? 'Small' : 'Large'}
                                                                    </Badge>
                                                                    {accommodation.is_air_conditioned && (
                                                                        <Badge variant="outline" className="text-xs font-medium">
                                                                            AC
                                                                        </Badge>
                                                                    )}
                                                                    {rate?.includes_free_entrance && (
                                                                        <Badge variant="secondary" className="text-xs font-medium bg-green-100 text-green-800 border-green-200">
                                                                            Free Entrance
                                                                        </Badge>
                                                                    )}
                                                                    {rate?.includes_free_cottage && (
                                                                        <Badge variant="secondary" className="text-xs font-medium bg-blue-100 text-blue-800 border-blue-200">
                                                                            Free Cottage
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center justify-between">
                                                                    {rate && (
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground">Starting from</p>
                                                                            <p className="text-2xl font-bold text-primary">
                                                                                ₱{parseFloat(rate.rate.toString()).toLocaleString()}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                    <Badge
                                                                        variant={isAvailable ? "default" : "destructive"}
                                                                        className="text-xs px-3 py-1"
                                                                    >
                                                                        {isAvailable ? "Available" : "Booked"}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Step 2: Booking Details */}
                    <TabsContent value="details" className="space-y-4 mt-6">
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="guest_name">Full Name *</Label>
                                <Input
                                    id="guest_name"
                                    value={bookingForm.data.guest_name}
                                    onChange={(e) => bookingForm.setData('guest_name', e.target.value)}
                                    disabled={!!auth.user}
                                    required
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="guest_email">Email *</Label>
                                <Input
                                    id="guest_email"
                                    type="email"
                                    value={bookingForm.data.guest_email}
                                    onChange={(e) => bookingForm.setData('guest_email', e.target.value)}
                                    disabled={!!auth.user}
                                    required
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="guest_phone">Phone Number *</Label>
                                <Input
                                    id="guest_phone"
                                    value={bookingForm.data.guest_phone}
                                    onChange={(e) => bookingForm.setData('guest_phone', e.target.value)}
                                    disabled={!!auth.user}
                                    required
                                    placeholder="09XX XXX XXXX"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="total_adults">Adults *</Label>
                                <Input
                                    id="total_adults"
                                    type="number"
                                    min="1"
                                    value={bookingForm.data.total_adults}
                                    onChange={(e) => bookingForm.setData('total_adults', parseInt(e.target.value) || 1)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="total_children">Children</Label>
                                <Input
                                    id="total_children"
                                    type="number"
                                    min="0"
                                    value={bookingForm.data.total_children}
                                    onChange={(e) => bookingForm.setData('total_children', parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Address *</Label>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <LocationSelect
                                        value={selectedCountry}
                                        onChange={handleCountryChange}
                                        options={countryOptions}
                                        placeholder="Select country"
                                        disabled={!!auth.user}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <LocationSelect
                                        value={selectedProvince}
                                        onChange={handleProvinceChange}
                                        options={provinceOptions}
                                        placeholder="Select province/state"
                                        disabled={!selectedCountry || !!auth.user}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <LocationSelect
                                        value={selectedCity}
                                        onChange={handleCityChange}
                                        options={cityOptions}
                                        placeholder="Select city"
                                        disabled={!selectedProvince || !!auth.user}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Input
                                        id="address_line"
                                        type="text"
                                        value={addressLine}
                                        onChange={(e) => setAddressLine(e.target.value)}
                                        placeholder="Street address and/or barangay"
                                        disabled={!selectedCity || !!auth.user}
                                    />
                                </div>
                            </div>
                        </div>

                        {bookingType === 'overnight' && (
                            <div className="space-y-2">
                                <Label htmlFor="check_out_date">Check-out Date *</Label>
                                <Input
                                    id="check_out_date"
                                    type="date"
                                    value={bookingForm.data.check_out_date}
                                    onChange={(e) => bookingForm.setData('check_out_date', e.target.value)}
                                    min={minCheckOutDate}
                                    required
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="notes">Special Requests (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={bookingForm.data.notes}
                                onChange={(e) => bookingForm.setData('notes', e.target.value)}
                                rows={3}
                                placeholder="Any special requests or requirements..."
                            />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentTab('availability')}
                                className="flex-1"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={() => setCurrentTab('summary')}
                                className="flex-1"
                            >
                                Continue to Summary
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Step 3: Booking Summary */}
                    <TabsContent value="summary" className="space-y-4 mt-6">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentTab('details')}
                                className="flex-1"
                            >
                                Back to Details
                            </Button>
                            <Button
                                onClick={handleDetailsNext}
                                disabled={bookingForm.processing}
                                className="flex-1"
                            >
                                {bookingForm.processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                {auth.user ? 'Confirm Booking' : 'Continue'}
                            </Button>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Booking Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Guest Information */}
                                <div>
                                    <h4 className="font-semibold mb-3">Guest Information</h4>
                                    <div className="grid gap-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Name:</span>
                                            <span className="font-medium">{bookingForm.data.guest_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Email:</span>
                                            <span className="font-medium">{bookingForm.data.guest_email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Phone:</span>
                                            <span className="font-medium">{bookingForm.data.guest_phone}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Guests:</span>
                                            <span className="font-medium">
                                                {bookingForm.data.total_adults} Adult{bookingForm.data.total_adults > 1 ? 's' : ''}
                                                {bookingForm.data.total_children > 0 && `, ${bookingForm.data.total_children} Child${bookingForm.data.total_children > 1 ? 'ren' : ''}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Booking Details */}
                                <div>
                                    <h4 className="font-semibold mb-3">Booking Details</h4>
                                    <div className="grid gap-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Type:</span>
                                            <span className="font-medium capitalize">{bookingType.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Check-in:</span>
                                            <span className="font-medium">{format(new Date(selectedDate), 'MMMM dd, yyyy')}</span>
                                        </div>
                                        {bookingType === 'overnight' && bookingForm.data.check_out_date && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Check-out:</span>
                                                    <span className="font-medium">{format(new Date(bookingForm.data.check_out_date), 'MMMM dd, yyyy')}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Nights:</span>
                                                    <span className="font-medium">{summary.numberOfNights}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                {/* Selected Accommodations */}
                                <div>
                                    <h4 className="font-semibold mb-3">Selected Accommodations</h4>
                                    <div className="space-y-3">
                                        {selectedAccommodations.map((selected, index) => {
                                            const accommodation = availableAccommodations.find(a => a.id === selected.accommodation_id);
                                            const rate = bookingType === 'day_tour' ? accommodation?.day_tour_rate : accommodation?.overnight_rate;

                                            if (!accommodation || !rate) return null;

                                            return (
                                                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                                                    {accommodation.first_image_url ? (
                                                        <img
                                                            src={accommodation.first_image_url}
                                                            alt={accommodation.name}
                                                            className="h-16 w-16 rounded object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                                                            <Hotel className="h-8 w-8 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="font-medium">{accommodation.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            ₱{parseFloat(rate.rate.toString()).toLocaleString()} {bookingType === 'overnight' && `× ${summary.numberOfNights} night${summary.numberOfNights > 1 ? 's' : ''}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <Separator />

                                {/* Price Breakdown */}
                                <div>
                                    <h4 className="font-semibold mb-3">Price Breakdown</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Accommodation Total:</span>
                                            <span className="font-medium">₱{summary.accommodationTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Entrance Fee Total:</span>
                                            <span className="font-medium">₱{summary.entranceFeeTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        {summary.totalFreeEntrances > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Free Entrances Included:</span>
                                                <span className="font-medium">{summary.totalFreeEntrances} guest{summary.totalFreeEntrances > 1 ? 's' : ''}</span>
                                            </div>
                                        )}
                                        <Separator />
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total Amount:</span>
                                            <span className="text-primary">₱{summary.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Step 4: Register */}
                    {!auth.user && (
                        <TabsContent value="auth" className="space-y-4 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Create Your Account</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Please create an account to complete your booking. Your information will be saved for future bookings.
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleRegister} className="space-y-4">
                                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="register_name">Full Name *</Label>
                                                <Input
                                                    id="register_name"
                                                    value={bookingForm.data.register_name}
                                                    onChange={(e) => bookingForm.setData('register_name', e.target.value)}
                                                    readOnly
                                                    className="bg-muted"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="register_email">Email *</Label>
                                                <Input
                                                    id="register_email"
                                                    type="email"
                                                    value={bookingForm.data.register_email}
                                                    onChange={(e) => bookingForm.setData('register_email', e.target.value)}
                                                    readOnly
                                                    className="bg-muted"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="register_phone">Phone Number</Label>
                                                <Input
                                                    id="register_phone"
                                                    type="tel"
                                                    value={bookingForm.data.register_phone}
                                                    onChange={(e) => bookingForm.setData('register_phone', e.target.value)}
                                                    readOnly
                                                    className="bg-muted"
                                                    placeholder="09XX XXX XXXX"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="register_address">Address</Label>
                                                <Input
                                                    id="register_address"
                                                    value={bookingForm.data.register_address}
                                                    onChange={(e) => bookingForm.setData('register_address', e.target.value)}
                                                    readOnly
                                                    className="bg-muted"
                                                    placeholder="Your address"
                                                />
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="register_password">Create Password *</Label>
                                                <PasswordInput
                                                    id="register_password"
                                                    value={bookingForm.data.register_password}
                                                    onChange={(e) => {
                                                        bookingForm.setData('register_password', e.target.value);
                                                        setShowPasswordRequirements(e.target.value.length > 0);
                                                    }}
                                                    required
                                                />
                                                <PasswordRequirements
                                                    password={bookingForm.data.register_password}
                                                    show={showPasswordRequirements}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="register_password_confirmation">Confirm Password *</Label>
                                                <PasswordInput
                                                    id="register_password_confirmation"
                                                    value={bookingForm.data.register_password_confirmation}
                                                    onChange={(e) => bookingForm.setData('register_password_confirmation', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setCurrentTab('summary')}
                                                className="flex-1"
                                            >
                                                Back to Summary
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={bookingForm.processing || !isPasswordValid || !isPasswordMatch}
                                                className="flex-1"
                                            >
                                                {bookingForm.processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                                Create Account & Book
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
