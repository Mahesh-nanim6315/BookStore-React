import React from 'react'

const ProfilePartialsUpdatePasswordForm = () => {
  return (
    <div className="page">
<section>
    
        <h2 className="text-lg font-medium text-gray-900">
            
        </h2>

        <p className="mt-1 text-sm text-gray-600">
            
        </p>
    

    <form method="post" action="" className="mt-6 space-y-6">
{/*          */}
{/*          */}

        <div>
            <x-input-label htmlFor="update_password_current_password" :value="__('Current Password')" />
            <x-text-input id="update_password_current_password" name="current_password" type="password" className="mt-1 block w-full" autocomplete="current-password" />
            <x-input-error :messages="$errors->updatePassword->get('current_password')" className="mt-2" />
        </div>

        <div>
            <x-input-label htmlFor="update_password_password" :value="__('New Password')" />
            <x-text-input id="update_password_password" name="password" type="password" className="mt-1 block w-full" autocomplete="new-password" />
            <x-input-error :messages="$errors->updatePassword->get('password')" className="mt-2" />
        </div>

        <div>
            <x-input-label htmlFor="update_password_password_confirmation" :value="__('Confirm Password')" />
            <x-text-input id="update_password_password_confirmation" name="password_confirmation" type="password" className="mt-1 block w-full" autocomplete="new-password" />
            <x-input-error :messages="$errors->updatePassword->get('password_confirmation')" className="mt-2" />
        </div>

        <div className="flex items-center gap-4">
            <x-primary-button></x-primary-button>
{/* 
             (session('status') === 'password-updated') */}
                <p
                    x-data="{ show: true }"
                    x-show="show"
                    x-transition
                    x-init="setTimeout(() => show = false, 2000)"
                    className="text-sm text-gray-600"
                ></p>
{/*              */}
        </div>
    </form>
</section>
    </div>
  )
}

export default ProfilePartialsUpdatePasswordForm







