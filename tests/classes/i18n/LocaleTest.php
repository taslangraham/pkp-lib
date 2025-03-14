<?php

/**
 * @defgroup tests_classes_i18n I18N Class Test Suite
 */

/**
 * @file tests/classes/i18n/LocaleTest.php
 *
 * Copyright (c) 2014-2021 Simon Fraser University
 * Copyright (c) 2000-2021 John Willinsky
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @class LocaleTest
 *
 * @ingroup tests_classes_i18n
 *
 * @see Locale
 *
 * @brief Tests for the Locale class.
 */

namespace PKP\tests\classes\i18n;

use Mockery;
use Mockery\MockInterface;
use PHPUnit\Framework\Attributes\CoversClass;
use PKP\facades\Locale;
use PKP\i18n\LocaleConversion;
use PKP\i18n\LocaleMetadata;
use PKP\tests\PKPTestCase;

#[CoversClass(Locale::class)]
#[CoversClass(LocaleConversion::class)]
class LocaleTest extends PKPTestCase
{
    private \PKP\i18n\Locale $_locale;
    private array $_supportedLocales = ['en' => 'English', 'pt_BR' => 'Portuguese (Brazil)', 'pt' => 'Portuguese'];
    private string $_primaryLocale = 'pt_BR';

    protected function setUp(): void
    {
        parent::setUp();
        // Save the underlying Locale implementation and replaces it by a generic mock
        $this->_locale = Locale::getFacadeRoot();
        /** @var \PKP\i18n\Locale|MockInterface */
        $mock = Mockery::mock($this->_locale::class);
        $mock = $mock
            ->makePartial()
            // Custom locales
            ->shouldReceive('getLocales')
            ->andReturn(
                [
                    'en' => $this->_createMetadataMock('en', true),
                    'pt_BR' => $this->_createMetadataMock('pt_BR'),
                    'pt' => $this->_createMetadataMock('pt'),
                    'de' => $this->_createMetadataMock('de')
                ]
            )
            // Forward get() calls to the real locale, in order to use the already loaded translations
            ->shouldReceive('get')
            ->andReturnUsing(fn (...$args) => $this->_locale->get(...$args))
            // Custom supported locales
            ->shouldReceive('getSupportedLocales')
            ->andReturnUsing(fn () => $this->_supportedLocales)
            // Custom primary locale
            ->shouldReceive('getPrimaryLocale')
            ->andReturnUsing(fn () => $this->_primaryLocale)
            ->getMock();

        Locale::swap($mock);
    }

    protected function tearDown(): void
    {
        // Restores the original locale instance
        Locale::swap($this->_locale);
        parent::tearDown();
    }

    private function _createMetadataMock(string $locale, bool $isComplete = false): MockInterface
    {
        /** @var LocaleMetadata|MockInterface */
        $mock = Mockery::mock(LocaleMetadata::class, [$locale]);
        return $mock
            ->makePartial()
            ->shouldReceive('isComplete')
            ->andReturn($isComplete)
            ->getMock();
    }

    public function testIsLocaleComplete()
    {
        self::assertTrue(Locale::getMetadata('en')->isComplete());
        self::assertFalse(Locale::getMetadata('pt_BR')->isComplete());
        self::assertNull(Locale::getMetadata('xx_XX'));
    }

    public function testGetLocales()
    {
        $this->_primaryLocale = 'en';
        $expectedLocales = [
            'en' => 'English',
            'pt_BR' => 'Portuguese',
            'pt' => 'Portuguese',
            'de' => 'German'
        ];
        $locales = array_map(fn (LocaleMetadata $locale) => $locale->getDisplayName(), Locale::getLocales());
        self::assertEquals($expectedLocales, $locales);
    }

    public function testGetLocalesWithCountryName()
    {
        $expectedLocalesWithCountry = [
            'en' => 'English',
            'pt_BR' => 'Portuguese (Brazil)',
            'pt' => 'Portuguese',
            'de' => 'German'
        ];
        $locales = array_map(fn (LocaleMetadata $locale) => $locale->getDisplayName('en', true), Locale::getLocales());
        self::assertEquals($expectedLocalesWithCountry, $locales);
    }

    public function testGet3LetterFrom2LetterIsoLanguage()
    {
        self::assertEquals('eng', LocaleConversion::get3LetterFrom2LetterIsoLanguage('en'));
        self::assertEquals('por', LocaleConversion::get3LetterFrom2LetterIsoLanguage('pt'));
        self::assertEquals('fre', LocaleConversion::get3LetterFrom2LetterIsoLanguage('fr'));
        self::assertNull(LocaleConversion::get3LetterFrom2LetterIsoLanguage('xx'));
    }

    public function testGet2LetterFrom3LetterIsoLanguage()
    {
        self::assertEquals('en', LocaleConversion::get2LetterFrom3LetterIsoLanguage('eng'));
        self::assertEquals('pt', LocaleConversion::get2LetterFrom3LetterIsoLanguage('por'));
        self::assertEquals('fr', LocaleConversion::get2LetterFrom3LetterIsoLanguage('fre'));
        self::assertNull(LocaleConversion::get2LetterFrom3LetterIsoLanguage('xxx'));
    }

    public function testGet3LetterIsoFromLocale()
    {
        self::assertEquals('eng', LocaleConversion::get3LetterIsoFromLocale('en'));
        self::assertEquals('por', LocaleConversion::get3LetterIsoFromLocale('pt_BR'));
        self::assertEquals('por', LocaleConversion::get3LetterIsoFromLocale('pt'));
        self::assertNull(LocaleConversion::get3LetterIsoFromLocale('xx_XX'));
    }
}
