import React from 'react';
import CommanderManagement from '../components/CommanderManagement';

const CommanderPage = () => {
    return (
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold my-6">Department Commander Management</h1>
            <CommanderManagement />
        </div>
    );
};

export default CommanderPage; 