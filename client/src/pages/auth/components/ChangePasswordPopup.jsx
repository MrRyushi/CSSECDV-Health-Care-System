// ChangePasswordPopup.jsx
import React, { useState } from 'react';
import { getAuth, updatePassword } from 'firebase/auth';

const ChangePasswordPopup = ({ onClose }) => {
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChangePassword = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        const user = auth.currentUser;

        // Password strength check (optional, use your existing function here)
        if (newPassword.length < 12) {
            setError("Password must be at least 12 characters long.");
            return;
        }

        try {
            await updatePassword(user, newPassword);
            setSuccess("Password updated successfully.");
            setError('');
        } catch (err) {
            console.error(err);
            setError(err.message);
            setSuccess('');
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.popup}>
                <h2>Change Password</h2>
                <form onSubmit={handleChangePassword}>
                    <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                    <button type="submit" style={styles.button}>Update Password</button>
                    <button type="button" onClick={onClose} style={styles.cancelButton}>Cancel</button>
                </form>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000,
    },
    popup: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        width: '300px',
        boxShadow: '0 0 10px rgba(0,0,0,0.3)',
    },
    input: {
        width: '100%',
        padding: '8px',
        marginBottom: '10px',
    },
    button: {
        padding: '8px 12px',
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        marginRight: '8px',
    },
    cancelButton: {
        padding: '8px 12px',
        backgroundColor: '#f44336',
        color: '#fff',
        border: 'none',
    }
};

export default ChangePasswordPopup;
