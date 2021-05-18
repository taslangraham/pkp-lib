<?php

/**
 * @file plugins/importexport/users/PKPUserImportExportDeployment.inc.php
 *
 * Copyright (c) 2014-2021 Simon Fraser University
 * Copyright (c) 2000-2021 John Willinsky
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @class PKPUserImportExportDeployment
 * @ingroup plugins_importexport_user
 *
 * @brief Class configuring the user import/export process to this
 * application's specifics.
 */

use PKP\plugins\importexport\PKPImportExportDeployment;

class PKPUserImportExportDeployment extends PKPImportExportDeployment
{
    /** @var Site */
    public $_site;

    /**
     * Constructor
     *
     * @param $context Context
     * @param $user User
     */
    public function __construct($context, $user)
    {
        parent::__construct($context, $user);
        $site = Application::get()->getRequest()->getSite();
        $this->setSite($site);
    }

    /**
     * Set the site.
     *
     * @param $site Site
     */
    public function setSite($site)
    {
        $this->_site = $site;
    }

    /**
     * Get the site.
     *
     * @return Site
     */
    public function getSite()
    {
        return $this->_site;
    }

    /**
     * Get the schema filename.
     *
     * @return string
     */
    public function getSchemaFilename()
    {
        return 'pkp-users.xsd';
    }

    /**
     * Get the namespace URN
     *
     * @return string
     */
    public function getNamespace()
    {
        return 'http://pkp.sfu.ca';
    }
}
