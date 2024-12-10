/**
 * @file cypress/tests/integration/Orcid.cy.js
 *
 * Copyright (c) 2014-2024 Simon Fraser University
 * Copyright (c) 2000-2024 John Willinsky
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

function openTemplate(mailableName, templateName) {
	// Select the mailable
	cy.contains('li.listPanel__item', mailableName)
		.find('button')
		.contains('Edit')
		.click();


	// Select the template
	cy.contains('.listPanel', 'Templates')
		.find('li.listPanel__item')
		.contains(templateName)
		.parents('li.listPanel__item')
		.find('button')
		.contains('Edit')
		.click();
}


function populateEmailTemplateBody(){
	cy.get('#editEmailTemplate-body-control-en_ifr')
	.its('0.contentDocument.body')
	.should('not.be.empty')
	.then((body) => {
		cy.wrap(body).clear().type('Test template body'); // Clear and type into the iframe body
	});
}

function setUnrestrictedTo(value) {
	cy.get('input[name="isUnrestricted"]')[value ? 'check' : 'uncheck']({ force: true }); // Uncheck the checkbox
}

describe('Email Template Access Tests', function () {
	it('Remove unrestricted from a template', () => {
		cy.login('admin', 'admin', 'publicknowledge');
		cy.visit('/index.php/publicknowledge/management/settings/manageEmails');

		openTemplate('Discussion (Production)', 'Discussion (Production)');
		setUnrestrictedTo(false)
		cy.contains('button', 'Save').click();
		// reload and check that template was updated
		cy.reload()
		openTemplate('Discussion (Production)', 'Discussion (Production)');
		cy.get('input[name="isUnrestricted"]').should('not.be.checked')
	});

	it('Marks template as unrestricted', () => {
		cy.login('admin', 'admin', 'publicknowledge');
		cy.visit('/index.php/publicknowledge/management/settings/manageEmails');

		openTemplate('Discussion (Production)', 'Discussion (Production)');
		cy.get('input[name="isUnrestricted"]').should('not.be.checked')
		setUnrestrictedTo(true);

		cy.contains('button', 'Save').click();
		cy.reload();

		openTemplate('Discussion (Production)', 'Discussion (Production)');
		cy.get('input[name="isUnrestricted"]').should('be.checked')
	});

	it('Assigns user groups to template', () => {
		cy.login('admin', 'admin', 'publicknowledge');
		cy.visit('/index.php/publicknowledge/management/settings/manageEmails');
		openTemplate('Discussion (Production)', 'Discussion (Production)');

		//  Assign the fist two user groups in the list
		cy.get('input[name="assignedUserGroupIds"]').first().check();
		cy.get('input[name="assignedUserGroupIds"]').eq(1).check();
		cy.contains('button', 'Save').click();

		cy.reload()

		openTemplate('Discussion (Production)', 'Discussion (Production)');
		cy.get('input[name="assignedUserGroupIds"]').first().should('be.checked');
		cy.get('input[name="assignedUserGroupIds"]').eq(1).should('be.checked');
	})

	it('Removes user groups from template', () => {
		cy.login('admin', 'admin', 'publicknowledge');
		cy.visit('/index.php/publicknowledge/management/settings/manageEmails');

		openTemplate('Discussion (Production)', 'Discussion (Production)');

		cy.get('input[name="assignedUserGroupIds"]').first().should('be.checked');
		cy.get('input[name="assignedUserGroupIds"]').eq(1).should('be.checked');

		cy.contains('button', 'Save').click();

		cy.reload();
		openTemplate('Discussion (Production)', 'Discussion (Production)');
		cy.get('input[name="assignedUserGroupIds"]').first().uncheck();
		cy.get('input[name="assignedUserGroupIds"]').eq(1).uncheck();
	})

	it('Creates template with user groups assigned (restricted template)', () => {
		cy.login('admin', 'admin', 'publicknowledge');
		cy.visit('/index.php/publicknowledge/management/settings/manageEmails');

		// Select the mailable
		cy.contains('li.listPanel__item', 'Discussion (Production)')
			.find('button')
			.contains('Edit')
			.click();

		cy.contains('button', 'Add Template').click()

		const templateName = 'TEST TEMPLATE NAME ' + (new Date()).getMilliseconds();
		cy.get('input[id^="editEmailTemplate-name-control-en"]').type(templateName)
		cy.get('input[id^="editEmailTemplate-subject-control-en"]').type('TEST TEMPLATE SUBJECT')

		populateEmailTemplateBody()
		setUnrestrictedTo(false)

		cy.contains('label', 'Journal editor').find('input[type="checkbox"]').check();

		// Assign two available user groups
		cy.get('input[name="assignedUserGroupIds"]').eq(1).check();
		cy.get('input[name="assignedUserGroupIds"]').eq(2).check();
		cy.contains('button', 'Save').click();

		cy.reload();

		openTemplate('Discussion (Production)', templateName)
		cy.get('input[name="assignedUserGroupIds"]').eq(1).should('be.checked');
		cy.get('input[name="assignedUserGroupIds"]').eq(2).should('be.checked');
	})

	it('Creates unrestricted template', () => {
		cy.login('admin', 'admin', 'publicknowledge');
		cy.visit('/index.php/publicknowledge/management/settings/manageEmails');

		// Select the mailable
		cy.contains('li.listPanel__item', 'Discussion (Production)')
			.find('button')
			.contains('Edit')
			.click();

		cy.contains('button', 'Add Template').click()

		const templateName = 'TEST TEMPLATE NAME ' + (new Date()).getMilliseconds();

		cy.get('input[id^="editEmailTemplate-name-control-en"]').type(templateName)
		cy.get('input[id^="editEmailTemplate-subject-control-en"]').type('TEST TEMPLATE SUBJECT')

		populateEmailTemplateBody();
	    setUnrestrictedTo(true);

		cy.contains('button', 'Save').click();

		cy.reload()
		openTemplate('Discussion (Production)', templateName)
		cy.get('input[name="isUnrestricted"]').should('be.checked')
	})

	it('Creates restricted template with no assigned user groups', () => {
		cy.login('admin', 'admin', 'publicknowledge');
		cy.visit('/index.php/publicknowledge/management/settings/manageEmails');

		// Select the mailable
		cy.contains('li.listPanel__item', 'Reinstate Submission Declined Without Review')
			.find('button')
			.contains('Edit')
			.click();

		cy.contains('button', 'Add Template').click()

		const templateName = 'TEST TEMPLATE NAME ' + (new Date()).getMilliseconds();

		cy.get('input[id^="editEmailTemplate-name-control-en"]').type(templateName)
		cy.get('input[id^="editEmailTemplate-subject-control-en"]').type('TEST TEMPLATE SUBJECT')

		populateEmailTemplateBody();
		setUnrestrictedTo(false);
		
		cy.contains('button', 'Save').click();

		cy.reload()
		openTemplate('Reinstate Submission Declined Without Review', templateName)
		cy.get('input[name="isUnrestricted"]').should('not.be.checked');
		
		cy.get('input[name="assignedUserGroupIds"]').each(($checkbox) => {
			cy.wrap($checkbox).should('not.be.checked');
		  });
	})
});
