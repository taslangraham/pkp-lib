<?php
/**
 * @file classes/components/form/context/PKPListsForm.php
 *
 * Copyright (c) 2014-2021 Simon Fraser University
 * Copyright (c) 2000-2021 John Willinsky
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @class PKPListsForm
 *
 * @ingroup classes_controllers_form
 *
 * @brief A preset form for configuring how a context handles lists of
 *  items in the UI.
 */

namespace PKP\components\forms\context;

use PKP\components\forms\FieldText;
use PKP\components\forms\FormComponent;

class PKPListsForm extends FormComponent
{
    public const FORM_LISTS = 'lists';
    public $id = self::FORM_LISTS;
    public $method = 'PUT';

    /**
     * Constructor
     *
     * @param string $action URL to submit the form to
     * @param array $locales Supported locales
     * @param \PKP\context\Context $context Journal or Press to change settings for
     */
    public function __construct($action, $locales, $context)
    {
        $this->action = $action;
        $this->locales = $locales;

        $this->addField(new FieldText('itemsPerPage', [
            'label' => __('common.itemsPerPage'),
            'description' => __('manager.setup.itemsPerPage.description'),
            'isRequired' => true,
            'value' => $context->getData('itemsPerPage'),
            'size' => 'small',
        ]))
            ->addField(new FieldText('numPageLinks', [
                'label' => __('manager.setup.numPageLinks'),
                'description' => __('manager.setup.numPageLinks.description'),
                'isRequired' => true,
                'value' => $context->getData('numPageLinks'),
                'size' => 'small',
            ]));
    }
}
