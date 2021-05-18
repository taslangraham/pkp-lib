<?php

/**
 * @file plugins/importexport/native/filter/NativeExportFilter.inc.php
 *
 * Copyright (c) 2014-2021 Simon Fraser University
 * Copyright (c) 2000-2021 John Willinsky
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @class NativeExportFilter
 * @ingroup plugins_importexport_native
 *
 * @brief Base class that converts a DataObject to a Native XML document
 */

use PKP\plugins\importexport\PKPImportExportFilter;
use PKP\xslt\XMLTypeDescription;

class NativeExportFilter extends PKPImportExportFilter
{
    /** @var boolean If set to true no validation (e.g. XML validation) will be done */
    public $_noValidation = null;
    public $opts = [];

    /**
     * Set no validation option
     *
     * @param $noValidation boolean
     */
    public function setNoValidation($noValidation)
    {
        $this->_noValidation = $noValidation;
    }

    /**
     * Get no validation option
     *
     * @return boolean true|null
     */
    public function getNoValidation()
    {
        return $this->_noValidation;
    }

    //
    // Public methods
    //
    /**
     * @copydoc Filter::supports()
     */
    public function supports(&$input, &$output)
    {
        // Validate input
        $inputType = & $this->getInputType();
        $validInput = $inputType->isCompatible($input);

        // If output is null then we're done
        if (is_null($output)) {
            return $validInput;
        }

        // Validate output
        $outputType = & $this->getOutputType();

        if ($outputType instanceof XMLTypeDescription && $this->getNoValidation()) {
            $outputType->setValidationStrategy(XMLTypeDescription::XML_TYPE_DESCRIPTION_VALIDATE_NONE);
        }
        $validOutput = $outputType->isCompatible($output);

        return $validInput && $validOutput;
    }

    //
    // Helper functions
    //
    /**
     * Create a set of child nodes of parentNode containing the
     * localeKey => value data representing translated content.
     *
     * @param $doc DOMDocument
     * @param $parentNode DOMNode
     * @param $name string Node name
     * @param $values array Array of locale key => value mappings
     */
    public function createLocalizedNodes($doc, $parentNode, $name, $values)
    {
        $deployment = $this->getDeployment();
        if (is_array($values)) {
            foreach ($values as $locale => $value) {
                if ($value === '') {
                    continue;
                } // Skip empty values
                $parentNode->appendChild($node = $doc->createElementNS($deployment->getNamespace(), $name, htmlspecialchars($value, ENT_COMPAT, 'UTF-8')));
                $node->setAttribute('locale', $locale);
            }
        }
    }

    /**
     * Create an optional node with a name and value.
     *
     * @param $doc DOMDocument
     * @param $parentNode DOMElement
     * @param $name string
     * @param $value string|null
     *
     * @return DOMElement|null
     */
    public function createOptionalNode($doc, $parentNode, $name, $value)
    {
        if ($value === '' || $value === null) {
            return null;
        }

        $deployment = $this->getDeployment();
        $parentNode->appendChild($node = $doc->createElementNS($deployment->getNamespace(), $name, htmlspecialchars($value, ENT_COMPAT, 'UTF-8')));
        return $node;
    }

    /**
     * Set xml filtering opts
     *
     * @param $opts array
     */
    public function setOpts($opts)
    {
        $this->opts = $opts;
    }
}
