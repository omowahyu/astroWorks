import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { CreditCard, MessageSquare, Building2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Payment Settings',
        href: '/dashboard/payment',
    },
];

interface PaymentSetting {
    id: number;
    key: string;
    value: string;
    type: string;
    group: string;
    label: string;
    description: string;
}

interface PageProps {
    settings: {
        whatsapp: PaymentSetting[];
        bank: PaymentSetting[];
        general: PaymentSetting[];
    };
}

export default function PaymentSettings() {
    const { settings } = usePage<PageProps>().props;

    // Flatten settings for easier form handling
    const allSettings = [
        ...(settings.whatsapp || []),
        ...(settings.bank || []),
        ...(settings.general || [])
    ];

    // Create initial form data
    const initialData = allSettings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
    }, {} as Record<string, string>);

    const { data, setData, patch, processing, errors, reset } = useForm(initialData);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        patch('/dashboard/payment', {
            onSuccess: () => {
                console.log('Settings updated successfully');
            },
            onError: (errors) => {
                console.error('Update failed:', errors);
            }
        });
    };

    const renderSettingInput = (setting: PaymentSetting) => {
        const value = data[setting.key] || '';

        if (setting.type === 'text') {
            return (
                <Textarea
                    id={setting.key}
                    value={value}
                    onChange={(e) => setData(setting.key, e.target.value)}
                    placeholder={setting.description}
                    rows={4}
                    className="min-h-[100px]"
                />
            );
        }

        return (
            <Input
                id={setting.key}
                type={setting.type === 'number' ? 'number' : 'text'}
                value={value}
                onChange={(e) => setData(setting.key, e.target.value)}
                placeholder={setting.description}
            />
        );
    };

    const renderSettingsGroup = (groupSettings: PaymentSetting[], title: string, icon: React.ReactNode, description: string) => {
        if (!groupSettings || groupSettings.length === 0) return null;

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        {icon}
                        <span>{title}</span>
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {groupSettings.map((setting) => (
                        <div key={setting.key} className="space-y-2">
                            <Label htmlFor={setting.key} className="text-sm font-medium">
                                {setting.label}
                            </Label>
                            {renderSettingInput(setting)}
                            {setting.description && (
                                <p className="text-xs text-muted-foreground">{setting.description}</p>
                            )}
                            {errors[setting.key] && (
                                <p className="text-xs text-red-600">{errors[setting.key]}</p>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment Settings" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Payment Settings</h1>
                    <p className="text-muted-foreground">Manage your payment and WhatsApp checkout settings</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* WhatsApp Settings */}
                    {renderSettingsGroup(
                        settings.whatsapp || [],
                        'WhatsApp Settings',
                        <MessageSquare className="h-5 w-5" />,
                        'Configure WhatsApp checkout settings and message templates'
                    )}

                    {/* Bank Settings */}
                    {renderSettingsGroup(
                        settings.bank || [],
                        'Bank Account Information',
                        <Building2 className="h-5 w-5" />,
                        'Configure bank account details for customer transfers'
                    )}

                    {/* General Settings */}
                    {renderSettingsGroup(
                        settings.general || [],
                        'General Payment Settings',
                        <CreditCard className="h-5 w-5" />,
                        'General payment configuration options'
                    )}

                    <Separator />

                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => reset()}
                            disabled={processing}
                        >
                            Reset Changes
                        </Button>

                        <Button
                            type="submit"
                            disabled={processing}
                        >
                            {processing ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>

                {/* Preview Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Preview</CardTitle>
                        <CardDescription>Preview how your settings will appear to customers</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-medium text-sm text-foreground mb-2">Bank Transfer Information:</h4>
                            <div className="bg-muted p-3 rounded-lg text-sm">
                                <p className="font-medium">Bank {data.bank_name || 'BCA'}</p>
                                <p>{data.bank_account_name || 'Astro Works Indonesia PT'}</p>
                                <p className="font-mono font-bold text-lg">{data.bank_account_number || '7025899002'}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-sm text-foreground mb-2">WhatsApp Number:</h4>
                            <div className="bg-muted p-3 rounded-lg text-sm">
                                <p className="font-mono">+{data.whatsapp_number || '62822222137'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
