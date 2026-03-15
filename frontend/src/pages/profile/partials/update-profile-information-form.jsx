import React from 'react'

const ProfilePartialsUpdateProfileInformationForm = () => {
  return (
    <div className="page">
{/*   */}
<section className="profile-section">
    
        <h2 className="profile-title">
            
        </h2>

        <p className="profile-subtitle">
            
        </p>
    

    <form id="send-verification" method="post" action="">
{/*          */}
    </form>

    <form method="post" action="" className="profile-form">
{/*          */}
{/*          */}

        <div className="form-group">
            <x-input-label htmlFor="name" :value="__('Name')" />
            <x-text-input id="name" name="name" type="text" className="form-input"
                :value="old('name', $user->name)" required autofocus autocomplete="name" />
            <x-input-error className="form-error" :messages="$errors->get('name')" />
        </div>

        <div className="form-group">
            <x-input-label htmlFor="email" :value="__('Email')" />
            <x-text-input id="email" name="email" type="email" className="form-input"
                :value="old('email', $user->email)" required autocomplete="username" />
            <x-input-error className="form-error" :messages="$errors->get('email')" />
{/* 
             ($user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail && ! $user->hasVerifiedEmail()) */}
                <div className="verification-box">
                    <p className="verification-text">
                        

                        <button form="send-verification" className="verification-btn">
                            
                        </button>
                    </p>
{/* 
                     (session('status') === 'verification-link-sent') */}
                        <p className="verification-success">
                            
                        </p>
{/*                      */}
                </div>
{/*              */}
        </div>

        <div className="form-actions">
            <x-primary-button className="save-btn"></x-primary-button>
{/* 
             (session('status') === 'profile-updated') */}
                <p x-data="{ show: true }" x-show="show" x-transition
                   x-init="setTimeout(() => show = false, 2000)"
                   className="save-message">
                    
                </p>
{/*              */}
        </div>
    </form>
</section>
    </div>
  )
}

export default ProfilePartialsUpdateProfileInformationForm







