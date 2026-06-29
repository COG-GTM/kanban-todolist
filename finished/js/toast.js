        // ==========================================
        // PREMIUM USER INTERFACE NOTIFICATIONS (TOASTS)
        // ==========================================
        function showToast(message, type = 'info') {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            
            let icon = 'fa-info-circle';
            if (type === 'success') icon = 'fa-check-circle';
            if (type === 'warning') icon = 'fa-exclamation-triangle';
            if (type === 'error') icon = 'fa-exclamation-circle';

            toast.innerHTML = `
                <i class="fas ${icon}"></i>
                <span class="toast-message">${message}</span>
            `;
            container.appendChild(toast);

            // Trigger entry spring-like slide interpolation
            setTimeout(() => {
                toast.classList.add('show');
            }, 50);

            // Automatically clean up after 3 seconds
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }, 3000);
        }
