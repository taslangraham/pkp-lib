/**
 * @file cypress/tests/integration/Orcid.cy.js
 *
 * Copyright (c) 2014-2021 Simon Fraser University
 * Copyright (c) 2000-2021 John Willinsky
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

describe('ORCID tests', function() {

	it('Enables ORCID', function() {
		cy.login('admin', 'admin');

		cy.visit('index.php/publicknowledge/management/settings/access');
		cy.get('#orcidSettings-button').should('exist').click();

		// Check that the checkbox to enable ORCID is visible
		cy.get('input[name^="orcidEnabled"]').should('be.visible');

		cy.get('input[name^="orcidEnabled"]')
			.then(checkbox => {
				if (!checkbox.prop('checked')) {
					cy.get('input[name^="orcidEnabled"]').click();

					// Check that the form fields are visible
					cy.get('select[name="orcidApiType"]').should('be.visible').select('memberSandbox');
					cy.get('input[name="orcidClientId"]').should('be.visible').clear().type('TEST_CLIENT_ID', {delay: 0});
					cy.get('input[name="orcidClientSecret"]').should('be.visible').clear().type('TEST_SECRET', {delay: 0});
					cy.get('input[name="orcidCity"]').should('be.visible');
					cy.get('input[name="orcidSendMailToAuthorsOnPublication"]').should('be.visible').check();
					cy.get('select[name="orcidLogLevel"]').should('be.visible').select('INFO');
					cy.get('button:contains("Save")').eq(1).should('be.visible').click();

					// reload to check that data was saved
					cy.reload();
					cy.get('input[name="orcidClientId"]').should('be.visible');
				}
			});
	});

	it('Sends ORCID verification request to author', function() {
		cy.login('dbarnes');
		cy.visit('index.php/publicknowledge/en/dashboard/editorial?currentViewId=assigned-to-me');

		// CLick on first submission in submission list
		cy.get('button[aria-describedby^="submission-title-"]').first().click();

		// TODO Check that the Publications sections is expanded before attempting to click on Contributors
		cy.get('a').contains('Contributors').click();

		cy.get('div.listPanel__itemActions').contains('Primary Contact').parents('div.listPanel__itemActions').within(() => {
			cy.contains('button', 'Edit').click();

		}).then(() => {
			cy.contains('Request verification').click();
			cy.get('button').contains('Yes').click();
			cy.contains('ORCID Verification has been requested! Resend Verification Email').should('be.visible');
		});

	});

	it('Adds ORCID to user profile', function() {
		cy.login('dbarnes');
		cy.visit('index.php/publicknowledge/en/user/profile');
		cy.window().then(win => cy.stub(win, 'open').returns({}));

		cy.get('#connect-orcid-button').should('be.visible').click();
	});

	it('Uses ORCID in registrations', function() {
		cy.visit('index.php/publicknowledge/user/register');

		// Prevent ORCID window from opening
		cy.window().then(win => cy.stub(win, 'open').returns({}));

		// Simulate population of form field with user's orcid data
		cy.get('#connect-orcid-button').should('be.visible').invoke('removeAttr', 'target').click().then(() => {
			cy.get("#email").clear().type('john.doe@example.com');
			cy.get("#givenName").clear().type('John');
			cy.get("#familyName").clear().type('Doe');
			cy.get("#affiliation").clear().type('PKP');
			cy.get("#country").select('JM');
			cy.get("#orcid").should('be.hidden').clear().type('000-000-000223', {force:true});

		// 	Todo: Submit form
		});
	});

	it('Disables ORCID', function() {
		cy.login('admin', 'admin');

		cy.visit('index.php/publicknowledge/management/settings/access');
		cy.get('#orcidSettings-button').should('exist').click();

		// Check that the checkbox to disbaled ORCID is visible
		cy.get('input[name^="orcidEnabled"]').should('be.visible');

		cy.get('input[name^="orcidEnabled"]')
			.then(checkbox => {
				if (checkbox.prop('checked')) {
					cy.get('input[name^="orcidEnabled"]').click();

					// Check that the form fields are visible
					cy.get('select[name="orcidApiType"]').should('not.exist');
					cy.get('input[name="orcidClientId"]').should('not.exist');
					cy.get('input[name="orcidClientSecret"]').should('not.exist');
					cy.get('input[name="orcidCity"]').should('not.exist');
					cy.get('input[name="orcidSendMailToAuthorsOnPublication"]').should('not.exist');
					cy.get('select[name="orcidLogLevel"]').should('not.exist');
					cy.get('button:contains("Save")').eq(1).should('be.visible').click();

					// reload to check that data was saved
					cy.reload();
					cy.get('input[name^="orcidEnabled"]').should('not.be.checked');
				}
			});
	});

});
