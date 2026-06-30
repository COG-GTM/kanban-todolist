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

        // ==========================================
        // TOAST WITH AN INLINE "UNDO" ACTION
        // Stays visible longer so the user has time to react. Invoking the
        // action runs the supplied callback and dismisses the toast early.
        // ==========================================
        function showUndoToast(message, onUndo, duration = 6000) {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            toast.className = 'toast toast-info';

            toast.innerHTML = `
                <i class="fas fa-trash-can"></i>
                <span class="toast-message">${message}</span>
                <button type="button" class="toast-action">Undo</button>
            `;
            container.appendChild(toast);

            let dismissed = false;
            const dismiss = () => {
                if (dismissed) return;
                dismissed = true;
                clearTimeout(timer);
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            };

            toast.querySelector('.toast-action').addEventListener('click', () => {
                dismiss();
                onUndo();
            });

            setTimeout(() => {
                toast.classList.add('show');
            }, 50);

            const timer = setTimeout(dismiss, duration);
        }
