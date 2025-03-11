import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from 'sonner';

interface OTPVerificationProps {
    onSuccess: (data: any) => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ onSuccess }) => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:7000/api/auth/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send OTP');
            }

            toast.success('OTP Sent!', {
                description: 'Please check your email for the OTP'
            });
            setStep('otp');
        } catch (error: any) {
            toast.error('Error', {
                description: error.message || 'Failed to send OTP'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:7000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    name,
                    provider: 'email',
                    otp,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to verify OTP');
            }

            toast.success('Success!', {
                description: 'OTP verified successfully'
            });
            onSuccess(data);
        } catch (error: any) {
            toast.error('Error', {
                description: error.message || 'Failed to verify OTP'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Email Verification</CardTitle>
                <CardDescription>
                    {step === 'email' 
                        ? 'Enter your email to receive an OTP'
                        : 'Enter the OTP sent to your email'
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                {step === 'email' ? (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending OTP
                                </>
                            ) : (
                                'Send OTP'
                            )}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="otp">OTP</Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                maxLength={6}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying
                                </>
                            ) : (
                                'Verify OTP'
                            )}
                        </Button>
                    </form>
                )}
            </CardContent>
            <CardFooter className="flex justify-center">
                {step === 'otp' && (
                    <Button
                        variant="link"
                        onClick={() => {
                            setStep('email');
                            setOtp('');
                        }}
                    >
                        Back to Email
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

export default OTPVerification; 