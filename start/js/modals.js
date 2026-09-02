const focusBeforeModal = {};

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    focusBeforeModal[modalId] = document.activeElement;
    modal.classList.add('active');

    const firstField = modal.querySelector('input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button');
    if (firstField) firstField.focus();
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    if (modalId === 'taskModal') editingTaskId = null;

    const previous = focusBeforeModal[modalId];
    focusBeforeModal[modalId] = null;
    if (previous && document.body.contains(previous)) previous.focus();
}

let confirmationPending = false;

function requestConfirmation(title, message) {
    if (confirmationPending) return Promise.resolve(false);
    confirmationPending = true;

    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        document.getElementById('confirmModalTitle').textContent = title;
        document.getElementById('confirmModalMessage').textContent = message;
        modal.classList.add('active');

        const yes = document.getElementById('confirmYesBtn');
        const cancel = document.getElementById('confirmCancelBtn');
        const close = document.getElementById('confirmCloseBtn');

        const focusBeforeConfirm = document.activeElement;
        cancel.focus();

        const done = (val) => {
            modal.classList.remove('active');
            cleanup();
            confirmationPending = false;
            if (focusBeforeConfirm && document.body.contains(focusBeforeConfirm)) focusBeforeConfirm.focus();
            resolve(val);
        };
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
