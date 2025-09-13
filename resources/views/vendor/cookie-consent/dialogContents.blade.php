<div class="js-cookie-consent cookie-consent fixed bottom-0 inset-x-0 pb-2 z-50">
    <div class="max-w-7xl mx-auto px-6">
        <div class="p-4 md:p-2 rounded-lg bg-blue-50 border border-blue-200 shadow-lg backdrop-blur-sm">
            <div class="flex items-center justify-between flex-wrap">
                <div class="max-w-full flex-1 items-center md:w-0 md:inline">
                    <p class="md:ml-3 text-blue-900 cookie-consent__message font-medium">
                        {!! trans('cookie-consent::texts.message') !!}
                    </p>
                </div>
                <div class="mt-2 flex-shrink-0 w-full sm:mt-0 sm:w-auto">
                    <button class="js-cookie-consent-agree cookie-consent__agree cursor-pointer flex items-center justify-center px-6 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 shadow-md">
                        {{ trans('cookie-consent::texts.agree') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
