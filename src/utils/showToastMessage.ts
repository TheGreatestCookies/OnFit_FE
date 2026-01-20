import { toast } from 'react-toastify';

export const showToastErrorMessage = (message: string) => {
    toast.error(message);
};

export const showToastSuccessMessage = (message: string) => {
    toast.success(message);
};
