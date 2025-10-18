import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { setUser, removeUser } from '../redux/userSlice';
import { getUserData } from '../services/api';
import { User, UserRole } from '../types';

const useLoadUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await getUserData();
        if (!response?.success) {
          throw new Error('Invalid session');
        }
        
        const userData: User = {
            ...response.data,
            role: response.data.role.toLowerCase() as UserRole,
            token,
        };

        dispatch(setUser(userData));
      } catch (error: any) {
        dispatch(removeUser());
        const message = error?.response?.data?.message || 'Session expired. Please log in again.';
        enqueueSnackbar(message, { variant: 'error' });
        navigate('/auth');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, navigate]);

  return isLoading;
};

export default useLoadUser;
