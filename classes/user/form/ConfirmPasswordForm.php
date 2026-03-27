<?php

/**
 * @file classes/user/form/ConfirmPasswordForm.php
 *
 * Copyright (c) 2026 Simon Fraser University
 * Copyright (c) 2026 John Willinsky
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @class ConfirmPasswordForm
 *
 * @ingroup user_form
 *
 * @brief Form for user to confirm their password.
 */

namespace PKP\user\form;

use APP\core\Application;
use APP\template\TemplateManager;
use PKP\form\Form;
use PKP\form\validation\FormValidatorCustom;
use PKP\form\validation\FormValidatorCSRF;
use PKP\form\validation\FormValidatorPost;
use PKP\security\Validation;

class ConfirmPasswordForm extends Form
{
    /**
     * @copydoc
     */
    public function __construct()
    {
        parent::__construct('user/confirmPassword.tpl');

        $this->addCheck(new FormValidatorPost($this));
        $this->addCheck(new FormValidatorCSRF($this));

        $this->addCheck(new FormValidatorCustom($this, 'password', 'required', 'user.login.loginError', function ($password) {
            $userName = Application::get()->getRequest()->getUser()->getUsername();
            return Validation::checkCredentials($userName, $password);
        }));
    }

    /**
     * @copydoc
     */
    public function display($request = null, $template = null): void
    {
        $templateMgr = TemplateManager::getManager($request);
        $templateMgr->assign([
            'pageComponent' => 'Page',
            'cancelUrl' => $this->getData('cancelUrl'),
            'submitUrl' => $this->getData('submitUrl'),
            'pageWidth' => TemplateManager::PAGE_WIDTH_NARROW,
        ]);

        parent::display($request, $template);
    }

    /**
     * @copydoc
     */
    public function readInputData(): void
    {
        $this->readUserVars(['cancelUrl','source', 'password']);
    }
}
