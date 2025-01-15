import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DepartmentHeader = () => {
    const { auth } = useAuth();

    return (
        <div className="department-header">
            <h1>{auth?.user?.department_name || 'Fire Department'}</h1>
            {auth?.user?.department_settings?.logo_path && (
                <img 
                    src={auth.user.department_settings.logo_path} 
                    alt="Department Logo" 
                    className="department-logo"
                />
            )}
        </div>
    );
};

export default DepartmentHeader;