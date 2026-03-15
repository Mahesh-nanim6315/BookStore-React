import React from 'react'

const ComponentsDropdown = () => {
  return (
    <div className="page">
{/*  */}
{/* 
 */}
$alignmentClasses = match ($align) {
    'left' => 'ltr:origin-top-left rtl:origin-top-right start-0',
    'top' => 'origin-top',
    default => 'ltr:origin-top-right rtl:origin-top-left end-0',
};

$width = match ($width) {
    '48' => 'w-48',
    default => $width,
};
{/*  */}

<div className="relative" x-data="{ open: false }" .outside="open = false" .stop="open = false">
    <div ="open = ! open">
        
    </div>

    <div x-show="open"
            x-transition:enter="transition ease-out duration-200"
            x-transition:enter-start="opacity-0 scale-95"
            x-transition:enter-end="opacity-100 scale-100"
            x-transition:leave="transition ease-in duration-75"
            x-transition:leave-start="opacity-100 scale-100"
            x-transition:leave-end="opacity-0 scale-95"
            className="absolute z-50 mt-2  rounded-md shadow-lg "
            style={{ display: 'none' }}
{/*             ="open = false"> */}
        <div className="rounded-md ring-1 ring-black ring-opacity-5 ">
            
        </div>
    </div>
</div>
    </div>
  )
}

export default ComponentsDropdown







