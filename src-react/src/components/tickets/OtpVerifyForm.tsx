'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import OtpInput from "./OtpInput";
import SpinningButton from "../common/SpinningButton";
import { verifyOtp as admittoVerifyOtp } from "../../api/admitto-client";

interface OtpVerifyFormProps {
    email: string;
    vipCode?: string;
}

export default function OtpVerifyForm({ email, vipCode }: OtpVerifyFormProps) {
    const router = useRouter();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const code = otp.join("");
        try {
            const { token } = await admittoVerifyOtp(email, code, vipCode);
            const target = new URLSearchParams({ token, email });
            if (vipCode) {
                target.set("vip", vipCode);
            }
            router.push(`/tickets/register?${target.toString()}`);
        } catch (err: any) {
            setLoading(false);
            setError(err.message || "Verification failed. Please try again.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="ticket-form">
            {error && <div className="text-danger my-3">{error}</div>}
            <OtpInput value={otp} onChange={setOtp} />
            <SpinningButton loading={loading} disabled={otp.some(digit => digit === "")} className="mt-2">
                Verify email
            </SpinningButton>
        </form>
    );
}
