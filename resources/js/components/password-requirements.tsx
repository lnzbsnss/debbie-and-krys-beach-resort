import React from 'react';

interface PasswordRequirement {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
}

interface PasswordRequirementsProps {
    password: string;
    show?: boolean;
    className?: string;
}

interface RequirementItemProps {
    met: boolean;
    text: string;
}

// Validation function
export const validatePassword = (password: string) => {
    const requirements: PasswordRequirement = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[@$!%*?&]/.test(password),
    };

    const isValid = Object.values(requirements).every(req => req);
    return { requirements, isValid };
};

// Individual requirement item component
const RequirementItem: React.FC<RequirementItemProps> = ({ met, text }) => (
    <div className={`flex items-center gap-2 text-xs ${met ? 'text-green-600' : 'text-muted-foreground'}`}>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${met ? 'bg-green-600' : 'bg-muted-foreground'}`}></span>
        <span>{text}</span>
    </div>
);

// Main password requirements component
const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
    password,
    show = true,
    className = ""
}) => {
    if (!show) return null;

    const { requirements } = validatePassword(password);

    return (
        <div className={`mt-2 p-3 bg-muted/50 rounded-md border ${className}`}>
            <div className="text-xs font-medium text-foreground mb-2">Password Requirements:</div>
            <div className="space-y-1">
                <RequirementItem met={requirements.minLength} text="At least 8 characters" />
                <RequirementItem met={requirements.hasUppercase} text="One uppercase letter" />
                <RequirementItem met={requirements.hasLowercase} text="One lowercase letter" />
                <RequirementItem met={requirements.hasNumber} text="One number" />
                <RequirementItem met={requirements.hasSpecialChar} text="One special character (@$!%*?&)" />
            </div>
        </div>
    );
};

export default PasswordRequirements;
