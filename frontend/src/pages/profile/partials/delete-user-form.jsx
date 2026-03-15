import React from 'react'

const ProfilePartialsDeleteUserForm = () => {
  return (
    <div className="page">
{/*   */}
<section className="delete-section" style={{ marginTop: '100px' }}>
    
        <h2 className="delete-title">
            
        </h2>

        <p className="delete-subtitle">
            
        </p>
    

    <x-danger-button
        x-data=""
        x-on:click.prevent="$dispatch('open-modal', 'confirm-user-deletion')"
        className="delete-btn"
    ></x-danger-button>

    <x-modal name="confirm-user-deletion" :show="$errors->userDeletion->isNotEmpty()" focusable>
        <form method="post" action="" className="delete-form">
{/*              */}
{/*              */}

            <h2 className="delete-title">
                
            </h2>

            <p className="delete-subtitle">
                
            </p>

            <div className="form-groups">
                <x-input-label htmlFor="password" value="" className="sr-only" />
                <x-text-input id="password" name="password" type="password" className="form-input"
                    placeholder="" />
                <x-input-error :messages="$errors->userDeletion->get('password')" className="form-error" />
            </div>

            <div className="form-actions">
                <x-secondary-button x-on:click="$dispatch('close')" className="cancel-btn">
                    
                </x-secondary-button>

                <x-danger-button className="confirm-btn">
                    
                </x-danger-button>
            </div>
        </form>
    </x-modal>
</section>
    </div>
  )
}

export default ProfilePartialsDeleteUserForm







