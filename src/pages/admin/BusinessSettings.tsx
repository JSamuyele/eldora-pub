import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { RootState } from '../../redux/store';
import { apiFetch } from '../../services/api';


type FormInputs = {
  name: string;
  logo: string;
  brandColor: string;
};

const BusinessSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const { tenantId } = useSelector((state: RootState) => state.user);

  // Fetch current business details
  const { data: businessData, isLoading } = useQuery({
    queryKey: ['business', tenantId],
    queryFn: () => apiFetch(`/businesses/my-business`),
    enabled: !!tenantId,
  });

  const { register, handleSubmit, setValue } = useForm<FormInputs>();

  React.useEffect(() => {
    if (businessData?.data) {
      setValue('name', businessData.data.name);
      setValue('logo', businessData.data.logo);
      setValue('brandColor', businessData.data.brandColor);
    }
  }, [businessData, setValue]);

  const mutation = useMutation({
    mutationFn: (data: FormInputs) => apiFetch(`/businesses/my-business`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      enqueueSnackbar('Business details updated successfully!', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['business', tenantId] });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to update business details', { variant: 'error' });
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
      <h1 className="text-2xl font-semibold mb-6">Business Settings</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Business Name</label>
          <input {...register('name', { required: true })} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Business Logo</label>
          {businessData?.data?.logo && (
            <div className="my-2">
              <img src={businessData.data.logo} alt="Current Logo" className="h-20 w-auto rounded-lg" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                // In a real application, you would upload the file to a server
                // and get a URL back. For this example, we'll simulate it.
                const simulatedUrl = `https://picsum.photos/seed/${Date.now()}/200/200`;
                setValue('logo', simulatedUrl);
              }
            }}
            className={`${inputClass} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Brand Color</label>
          <input type="color" {...register('brandColor')} className={`${inputClass} h-12`} />
        </div>
        <button type="submit" disabled={mutation.isPending} className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition">
          {mutation.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default BusinessSettings;