// resources/js/pages/payment/show.tsx
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Payment, type PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Edit, QrCode, CheckCircle, XCircle, LoaderCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import payments from '@/routes/payments';
import bookings from '@/routes/bookings';
import refunds from '@/routes/refunds';
import { useAuth } from '@/hooks/use-auth';

const paymentMethodLabels: Record<string, string> = {
    cash: 'Cash',
    bank: 'Bank',
    gcash: 'GCash',
    maya: 'Maya',
    other: 'Other',
};

const paymentMethodColors: Record<string, string> = {
    cash: 'bg-green-100 text-green-800',
    bank: 'bg-purple-100 text-purple-800',
    gcash: 'bg-teal-100 text-teal-800',
    maya: 'bg-orange-100 text-orange-800',
    other: 'bg-gray-100 text-gray-800',
};

export default function Show({ payment }: PageProps & { payment: Payment }) {
    const { can, user, isAdmin, isStaff } = useAuth();
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const handleApprove = () => {
        setIsApproving(true);
        router.post(payments.approve.url({ payment: payment.id }), {}, {
            onFinish: () => setIsApproving(false)
        });
    };

    const handleReject = () => {
        setIsRejecting(true);
        router.post(payments.reject.url({ payment: payment.id }), {}, {
            onFinish: () => setIsRejecting(false)
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            pending: 'secondary',
            approved: 'default',
            rejected: 'destructive',
        };

        return (
            <Badge variant={variants[status] || 'secondary'} className="capitalize text-xs">
                {status}
            </Badge>
        );
    };

    const isOwner = payment.booking?.created_by === user?.id;
    const canEdit = payment.status === 'pending' && (isAdmin() || isStaff() || isOwner) && can('payment edit');

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={payments.index.url()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold">{payment.payment_number}</h1>
                        <p className="text-sm text-muted-foreground">Payment details</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {payment.status === 'pending' && (isAdmin() || isStaff()) && can('payment edit') && (
                        <>
                            <Button size="sm" onClick={handleApprove} disabled={isApproving}>
                                {isApproving ? (
                                    <LoaderCircle className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                ) : (
                                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                )}
                                Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={handleReject} disabled={isRejecting}>
                                {isRejecting ? (
                                    <LoaderCircle className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                ) : (
                                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                )}
                                Reject
                            </Button>
                        </>
                    )}

                    {canEdit && (
                        <Link href={payments.edit.url({ payment: payment.id })}>
                            <Button size="sm" variant="outline">
                                <Edit className="h-3.5 w-3.5 mr-1.5" />
                                Edit
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {payment.status === 'pending' && (
                <Card className="border-yellow-200 bg-yellow-50/50">
                    <CardContent className="py-3">
                        <p className="text-sm text-yellow-800">
                            {isOwner
                                ? 'This payment is pending approval from staff.'
                                : 'This payment is pending approval.'
                            }
                        </p>
                    </CardContent>
                </Card>
            )}

            {payment.status === 'rejected' && (
                <Card className="border-red-200 bg-red-50/50">
                    <CardContent className="py-3">
                        <p className="text-sm text-red-800">
                            This payment has been rejected.
                        </p>
                    </CardContent>
                </Card>
            )}

            {payment.reference_image_url && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Reference Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative inline-block">
                            <img
                                src={payment.reference_image_url}
                                alt="Payment reference"
                                className="w-full max-w-2xl h-64 object-cover rounded border cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setImageModalOpen(true)}
                            />
                            <p className="text-xs text-muted-foreground mt-1.5">
                                Click to view full size
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Payment Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Payment Number</p>
                            <p className="text-sm font-medium">{payment.payment_number}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                            {getStatusBadge(payment.status)}
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Amount</p>
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xl font-bold">₱{parseFloat(payment.amount).toLocaleString()}</p>
                                {payment.is_down_payment && (
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                        Down Payment
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Payment Method</p>
                            <Badge variant="outline" className={`capitalize text-xs ${paymentMethodColors[payment.payment_method]}`}>
                                {paymentMethodLabels[payment.payment_method]}
                            </Badge>
                        </div>

                        {payment.payment_account && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Payment Account</p>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">{payment.payment_account.account_name}</p>
                                    {payment.payment_account.account_number && (
                                        <p className="text-xs text-muted-foreground">{payment.payment_account.account_number}</p>
                                    )}
                                    {payment.payment_account.bank_name && (
                                        <p className="text-xs text-muted-foreground">{payment.payment_account.bank_name}</p>
                                    )}
                                    {payment.payment_account.qr_code_url && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() => setQrModalOpen(true)}
                                        >
                                            <QrCode className="mr-1.5 h-3.5 w-3.5" />
                                            View QR Code
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Payment Date</p>
                            <p className="text-sm font-medium">
                                {format(new Date(payment.payment_date), 'MMMM dd, yyyy')}
                            </p>
                        </div>
                        {payment.reference_number && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Reference Number</p>
                                <p className="text-sm font-medium">{payment.reference_number}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Booking Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Booking Number</p>
                            <Link
                                href={bookings.show.url({ booking: payment.booking_id })}
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                {payment.booking?.booking_number}
                            </Link>
                        </div>
                        {payment.booking && (
                            <>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Guest Name</p>
                                    <p className="text-sm font-medium">{payment.booking.guest_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Total Amount</p>
                                    <p className="text-sm font-medium">
                                        ₱{parseFloat(payment.booking.total_amount).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Paid Amount</p>
                                    <p className="text-sm font-medium text-green-600">
                                        ₱{parseFloat(payment.booking.paid_amount).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Balance</p>
                                    <p className="text-sm font-medium text-red-600">
                                        ₱{parseFloat(payment.booking.balance).toLocaleString()}
                                    </p>
                                </div>
                                {payment.booking.down_payment_required && (
                                    <>
                                        <div className="border-t pt-3">
                                            <p className="text-xs font-semibold text-muted-foreground mb-2">Down Payment Details</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-0.5">Down Payment Required</p>
                                            <p className="text-sm font-medium">
                                                ₱{parseFloat(payment.booking.down_payment_amount || '0').toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-0.5">Down Payment Paid</p>
                                            <p className="text-sm font-medium text-green-600">
                                                ₱{parseFloat(payment.booking.down_payment_paid).toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-0.5">Down Payment Balance</p>
                                            <p className="text-sm font-medium text-red-600">
                                                ₱{parseFloat(payment.booking.down_payment_balance).toLocaleString()}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {payment.refunds && payment.refunds.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium">Refunds</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {payment.refunds.map((refund) => (
                                    <Link
                                        key={refund.id}
                                        href={refunds.show.url({ refund: refund.id })}
                                        className="flex justify-between items-center p-2 border rounded hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="text-sm">
                                            <p className="font-medium">{refund.refund_number}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(refund.refund_date), 'MMM dd, yyyy')} · {refund.refund_method.replace('_', ' ')}
                                            </p>
                                        </div>
                                        <p className="font-medium text-sm text-red-600">-₱{parseFloat(refund.amount).toLocaleString()}</p>
                                    </Link>
                                ))}
                            </div>
                            <div className="mt-3 pt-3 border-t">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total Refunded:</span>
                                    <span className="font-medium text-red-600">
                                        ₱{parseFloat(payment.refunded_amount || '0').toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="font-semibold">Remaining Amount:</span>
                                    <span className="font-semibold text-green-600">
                                        ₱{parseFloat(payment.remaining_amount || payment.amount).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {payment.notes && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{payment.notes}</p>
                    </CardContent>
                </Card>
            )}

            {payment.created_by_user && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Submitted By</p>
                            <p className="text-sm font-medium">{payment.created_by_user.name}</p>
                        </div>
                        {payment.received_by_user && payment.status === 'approved' && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Approved By</p>
                                <p className="text-sm font-medium">{payment.received_by_user.name}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Submitted At</p>
                            <p className="text-sm font-medium">
                                {format(new Date(payment.created_at), 'MMMM dd, yyyy HH:mm')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {imageModalOpen && payment.reference_image_url && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setImageModalOpen(false)}
                >
                    <div className="relative max-w-7xl max-h-[90vh]">
                        <img
                            src={payment.reference_image_url}
                            alt="Payment reference full size"
                            className="max-w-full max-h-[90vh] object-contain rounded"
                        />
                        <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setImageModalOpen(false)}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}

            {qrModalOpen && payment.payment_account?.qr_code_url && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setQrModalOpen(false)}
                >
                    <div className="relative max-w-2xl">
                        <Card className="p-6">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-medium">
                                    {payment.payment_account.account_name} - QR Code
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center">
                                <img
                                    src={payment.payment_account.qr_code_url}
                                    alt="Payment account QR code"
                                    className="w-64 h-64 object-contain rounded border"
                                />
                                {payment.payment_account.account_number && (
                                    <p className="text-sm text-muted-foreground mt-4">
                                        {payment.payment_account.account_number}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setQrModalOpen(false)}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Payments', href: '/payments' },
            { title: 'Show', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
