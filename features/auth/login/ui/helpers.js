// features/auth/login/ui/helpers.js
export const updateHelperText = (element, helperElement, message, isError = false) => {
    helperElement.textContent = message;
    if (isError) {
        helperElement.classList.add('error-text');
        element.classList.add('error');
    } else {
        helperElement.classList.remove('error-text');
        element.classList.remove('error');
    }
};