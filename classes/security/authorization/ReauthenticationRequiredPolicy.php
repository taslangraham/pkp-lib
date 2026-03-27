<?php

/**
 * @file classes/security/authorization/ReauthenticationRequiredPolicy.php
 *
 * Copyright (c) 2026 Simon Fraser University
 * Copyright (c) 2026 John Willinsky
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @class ReauthenticationRequiredPolicy
 *
 * @ingroup security_authorization
 *
 * @brief Policy to require to reauthenticate when accessing sensutive pages within the application.
 * Currently only applicable to admins.
 */

namespace PKP\security\authorization;

use APP\core\Application;
use PKP\core\PKPRequest;

class ReauthenticationRequiredPolicy extends AuthorizationPolicy
{
    private PKPRequest $request;

    /**
     * @param PKPRequest $request
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

        if (Application::get()->getRequest()->getSessionGuard()->isElevatedSessionActive()) {
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

        // reauthentication is handled in the admin page handler since this is currently only applicable to admins
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
