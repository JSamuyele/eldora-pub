import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { apiFetch } from '../../services/api';

type FormInputs = {
  siteName: string;
  siteLogo: string;
  brandColor: string;
  maintenanceMode: boolean;
};

const SuperAdminSettings: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['super-admin-settings'],
    queryFn: () => apiFetch('/settings'),
  });

  const { register, handleSubmit, setValue, watch } = useForm<FormInputs>();
  const maintenanceMode = watch('maintenanceMode');

  React.useEffect(() => {
    if (settingsData?.data) {
      setValue('siteName', settingsData.data.siteName);
      setValue('siteLogo', settingsData.data.siteLogo);
      setValue('brandColor', settingsData.data.brandColor);
      setValue('maintenanceMode', settingsData.data.maintenanceMode);
    }
  }, [settingsData, setValue]);

  const mutation = useMutation({
    mutationFn: (data: FormInputs) => apiFetch('/settings', { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      enqueueSnackbar('Settings updated successfully!', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['super-admin-settings'] });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to update settings', { variant: 'error' });
    },
  });

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    mutation.mutate(data);
  };

  const inputClass = "w-full p-3 bg-[#1f1f1f] rounded-lg text-white outline-none focus:ring-2 focus:ring-yellow-400";

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Super Admin Settings</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Site Name</label>
          <input {...register('siteName', { required: true })} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Site Logo</label>
          {settingsData?.data?.siteLogo && (
            <div className="my-2">
              <img src={settingsData.data.siteLogo} alt="Current Logo" className="h-20 w-auto rounded-lg" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const simulatedUrl = `https://picsum.photos/seed/${Date.now()}/200/200`;
                setValue('siteLogo', simulatedUrl);
              }
            }}
            className={`${inputClass} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Brand Color</label>
          <input type="color" {...register('brandColor')} className={`${inputClass} h-12`} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Maintenance Mode</label>
            <p className="text-xs text-gray-500">Temporarily disable access to the site for non-admins.</p>
          </div>
          <label htmlFor="maintenanceMode" className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                id="maintenanceMode"
                className="sr-only"
                {...register('maintenanceMode')}
              />
              <div className={`block w-14 h-8 rounded-full ${maintenanceMode ? 'bg-yellow-400' : 'bg-gray-600'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${maintenanceMode ? 'transform translate-x-6' : ''}`}></div>
            </div>
          </label>
        </div>
        <button type="submit" disabled={mutation.isPending} className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition">
          {mutation.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default SuperAdminSettings;