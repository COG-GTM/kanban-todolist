        // ==========================================
        // PROMISE-BASED ACTIONS CONFIRMATION DIALOG (ASYNC MODAL)
        // ==========================================
        function requestConfirmation(title, message) {
            return new Promise((resolve) => {
                const modal = document.getElementById('confirmModal');
                const titleEl = document.getElementById('confirmModalTitle');
                const messageEl = document.getElementById('confirmModalMessage');
                const cancelBtn = document.getElementById('confirmCancelBtn');
                const closeBtn = document.getElementById('confirmCloseBtn');
                const yesBtn = document.getElementById('confirmYesBtn');

                titleEl.textContent = title;
                messageEl.textContent = message;
                modal.classList.add('active');

                const handleChoice = (confirmed) => {
                    modal.classList.remove('active');
                    cleanup();
                    resolve(confirmed);
                };

                const cleanup = () => {
                    cancelBtn.removeEventListener('click', onCancel);
                    closeBtn.removeEventListener('click', onCancel);
                    yesBtn.removeEventListener('click', onConfirm);
                };

                const onCancel = () => handleChoice(false);
                const onConfirm = () => handleChoice(true);

                cancelBtn.addEventListener('click', onCancel);
                closeBtn.addEventListener('click', onCancel);
                yesBtn.addEventListener('click', onConfirm);
            });
        }
        // ==========================================
        // GENERAL SYSTEM MODAL OVERLAY WRAPPER CONTROL
        // ==========================================
        function openModal(modalId) {
            document.getElementById(modalId).classList.add('active');
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
            if (modalId === 'taskModal') {
                editingTaskId = null;
            }
        }
