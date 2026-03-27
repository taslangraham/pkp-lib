<?php

/**
 * @file classes/security/authorization/AdminReauthenticationRequiredPolicy.php
 *
 * Copyright (c) 2026 Simon Fraser University
 * Copyright (c) 2026 John Willinsky
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @class AdminReauthenticationRequiredPolicy
 *
 * @ingroup security_authorization
 *
 * @brief Policy to require admin to reauthenticate when accessing Administration pages.
 */

namespace PKP\security\authorization;

use APP\core\Application;
use PKP\config\Config;
use PKP\core\PKPApplication;
use PKP\core\PKPRequest;
use PKP\core\PKPSessionGuard;
use PKP\security\Role;
use PKP\security\Validation;

class AdminReauthenticationRequiredPolicy extends AuthorizationPolicy
{
    private PKPRequest $request;

    /**
     * @param PKPRequest $request
     * @param array $roleIds - Array of Role IDs that are allowed to access the app area that requires sudo mode
     */
    public function __construct(PKPRequest $request)
    {
        parent::__construct();
        $this->request = $request;
    }

    /** @copydoc */
    public function effect(): int
    {
        $user = $this->request->getUser();

        if (!$user) {
            return AuthorizationPolicy::AUTHORIZATION_DENY;
        }

        if (PKPSessionGuard::isElevatedSessionActive()) {
            return AuthorizationPolicy::AUTHORIZATION_PERMIT;
        }

        // User needs to re-authenticate
        $this->setAdvice(
            AuthorizationPolicy::AUTHORIZATION_ADVICE_CALL_ON_DENY,
            [$this, 'callOnDeny', []]
        );

        return AuthorizationPolicy::AUTHORIZATION_DENY;
    }

    /**
     * Callback when user needs to re-authenticate. Redirects user to the admin/confirmAccess page.
     */
    public function callOnDeny(): void
    {
        $dispatcher = $this->request->getDispatcher();
        $params = ['source' => $this->request->getRequestPath()];

        $reauthenticationUrl = $dispatcher->url(
            $this->request,
            Application::ROUTE_PAGE,
            null,
            'admin',
            'confirmAccess',
            null,
            $params
        );

        $this->request->redirectUrl($reauthenticationUrl);
    }
}
