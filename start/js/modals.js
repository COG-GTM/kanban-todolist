function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    if (modalId === 'taskModal') editingTaskId = null;
}

function requestConfirmation(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        document.getElementById('confirmModalTitle').textContent = title;
        document.getElementById('confirmModalMessage').textContent = message;
        modal.classList.add('active');

        const yes = document.getElementById('confirmYesBtn');
        const cancel = document.getElementById('confirmCancelBtn');
        const close = document.getElementById('confirmCloseBtn');

        const done = (val) => { modal.classList.remove('active'); cleanup(); resolve(val); };
        const onYes = () => done(true);
        const onNo = () => done(false);
        function cleanup() {
            yes.removeEventListener('click', onYes);
            cancel.removeEventListener('click', onNo);
            close.removeEventListener('click', onNo);
        }
        yes.addEventListener('click', onYes);
        cancel.addEventListener('click', onNo);
        close.addEventListener('click', onNo);
    });
}
