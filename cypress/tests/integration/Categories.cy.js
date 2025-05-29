/**
 * @file cypress/tests/integration/Categories.cy.js
 *
 * Copyright (c) 2014-2023 Simon Fraser University
 * Copyright (c) 2000-2023 John Willinsky
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 */

describe('Tests categories in the submission wizard', function() {
	var username = 'catauthor';
	var familyName = 'Fraser';
	var title = 'Test submission wizard with categories';
	var categories = [
		'Applied Science > Computer Science',
		'Applied Science > Engineering'
	];

	// Skip OPS
	// No categories configured in OPS.
	if (Cypress.env('defaultGenre') === 'Preprint Text') {
		return;
	}

	it('Checks that categories field is not shown in submission wizard', function() {
		cy.register({
			'username': username,
			'givenName': 'Catalin',
			'familyName': familyName,
			'affiliation': 'Public Knowledge Project',
			'country': 'Canada'
		});


		cy.contains('Make a New Submission').click();

		// All required fields in the start submission form
		cy.setTinyMceContent('startSubmission-title-control', title);
		if (Cypress.env('defaultGenre') === 'Article Text') { // OJS only
			cy.get('label:contains("Articles")').click();
		}
		cy.get('label:contains("English")').click();
		cy.get('input[name="submissionRequirements"]').check();
		cy.get('input[name="privacyConsent"]').check();
		cy.contains('Begin Submission').click();

		// The submission wizard has loaded
		cy.get('.pkpSteps__step__label').contains('Upload Files');

		// Go to the For the Editors step
		cy.get('.submissionWizard__footer button').contains('Continue').click();
		cy.get('.submissionWizard__footer button').contains('Continue').click();
		cy.get('.submissionWizard__footer button').contains('Continue').click();

		// Categories field not present
		cy.get('.pkpFormFieldLabel:contains("Categories")').should('not.exist');

		// Categories not visible in review
		cy.get('.submissionWizard__footer button').contains('Continue').click();
		cy.get('.submissionWizard__reviewPanel__item__header:contains("Categories")').should('not.exist');
	});

	it('Enables categories in the submission wizard', function() {
		cy.login('dbarnes');
		cy.visit('index.php/publicknowledge/management/settings/workflow');
		cy.get('button').contains('Metadata').click();
		cy.get('label:contains("Yes, add a categories field to the submission wizard")').click();
		cy.get('#metadata button').contains('Save').click();
		cy.get('#metadata [role="status"]').contains('Saved');
	});

	it('Checks that categories field is shown in submission wizard', function() {
		cy.login(username);
		cy.visit('index.php/publicknowledge/dashboard/mySubmissions');
		cy.openSubmission(familyName);

		// The submission wizard has loaded
		cy.get('.pkpSteps__step__label').contains('Upload Files');

		// Go to the For the Editors step
		cy.get('.submissionWizard__footer button').contains('Continue').click();
		cy.get('.submissionWizard__footer button').contains('Continue').click();
		cy.get('.submissionWizard__footer button').contains('Continue').click();

		// Select categories
		categories.forEach((category) => {
			cy.contains('label', category)
				.should(($label) => {
					expect($label.text().trim()).to.equal(category);
				})
				.click();
		});

		// Categories visible in review
		cy.get('.submissionWizard__footer button').contains('Continue').click();
		cy.get('.submissionWizard__reviewPanel__item__header:contains("Categories")');
		categories.forEach((category) => {
			cy.get('.submissionWizard__reviewPanel__item__value:contains("' + category + '")');
		});
	});
});

describe('Test category management', function() {
	// Skip OPS
	// No categories configured in OPS.
	if (Cypress.env('defaultGenre') === 'Preprint Text') {
		return;
	}
	it('Adds a new top level category', function() {
		cy.login('dbarnes');
		cy.visit('index.php/publicknowledge/management/settings/context#categories');
		cy.addCategory('Modern Psychology', 'modern-psychology');
	});

	it('Adds nested sub categories', function() {
		cy.login('dbarnes');
		cy.visit('index.php/publicknowledge/management/settings/context#categories');
		cy.wait(1000); // Ensure table is properly updated before interacting with recently added category
		cy.addCategory('Cognitive Psychology', 'cognitive-psychology', 'Modern Psychology');

		// Add multiple sub categories
		cy.wait(1000);
		cy.addCategory('Memory and Learning', 'memory-and-learning', 'Cognitive Psychology');
		cy.wait(1000);
		cy.addCategory('Short-Term Memory', 'short-term-memory', 'Memory and Learning');

		cy.wait(1000);
		cy.addCategory('Perception', 'perception', 'Cognitive Psychology');
		cy.wait(1000);
		cy.addCategory('Visual Perception', 'visual-perception', 'Perception');
	});

	it('Edits a category', function() {
		cy.login('dbarnes');
		cy.visit('index.php/publicknowledge/management/settings/context#categories');

		cy.openCategory('Modern Psychology');


		cy.get('input[name^="title-en"]').clear().type('Modern Psychology Updated', {delay: 0});
		cy.get('input[name^="path"]').clear().type('psychology-path-updated', {delay: 0});
		cy.get('form.categories__categoryForm button:contains("Save")').click();

		// Check that refreshed table has updated category
		cy.contains('tr', 'Modern Psychology Updated');
	});

	it('Cancel deletion of a category', function() {
		cy.login('dbarnes');
		cy.visit('index.php/publicknowledge/management/settings/context#categories');

		const categoryName = 'Modern Psychology Updated';

		cy.contains('tr', categoryName)
			.find('button[aria-label="More Actions"]')
			.click()
			.then(() => {
				cy.get('div[role="menuitem"]')
					.contains('button', 'Delete Category')
					.click();
			});

		cy.contains(`Are you absolutely sure you want to delete "${categoryName}" category?`);
		cy.contains('Warning: Deleting this category will remove all 5 sub-categories within it.');
		cy.contains('Unassign this category from any submissions currently using it');
		cy.contains('This will not delete the submissions themselves — they will simply be left without a category.');
		cy.contains(`To confirm, please type the name of the category "${categoryName}" below to proceed`);
		cy.contains('button', 'I understand the consequences, delete this category');
		cy.get('button').contains('Cancel').click();

		// Check that the category is still present
		cy.contains('tr', categoryName);
	});

	it('Deletes a category along with its sub-categories', function() {
		const categoryLabel = 'Modern Psychology Updated';

		cy.login('dbarnes');
		cy.visit('index.php/publicknowledge/management/settings/context#categories');

		cy.contains('tr', categoryLabel)
			.find('button[aria-label="More Actions"]')
			.click()
			.then(() => {
				cy.get('div[role="menuitem"]')
					.contains('button', 'Delete Category')
					.click();
			});

		cy.contains(`Are you absolutely sure you want to delete "${categoryLabel}" category?`);
		cy.contains('Warning: Deleting this category will remove all 5 sub-categories within it.');
		cy.contains('Unassign this category from any submissions currently using it');
		cy.contains('This will not delete the submissions themselves — they will simply be left without a category.');
		cy.contains(`To confirm, please type the name of the category "${categoryLabel}" below to proceed`);
		cy.get('[data-cy="dialog"]').find('input.pkpFormField--text__input').type(categoryLabel);
		cy.contains('button', 'I understand the consequences, delete this category').click();

		cy.contains('Category Deleted');
		cy.contains(`"${categoryLabel}" and its 5 sub-categories have been successfully deleted.`);
		cy.contains('All submissions previously tagged under these categories are now unassigned. You can reassign them from the submission details page.');

		cy.contains('button', 'Back to Categories').click();
		cy.get(`tr:contains(${categoryLabel})`).should('not.exist');
	});
});

describe('Test category in submission dashboard', function() {
	// Skip OPS
	// No categories configured in OPS.
	if (Cypress.env('defaultGenre') === 'Preprint Text') {
		return;
	}

	const workflowMenu = Cypress.env('defaultGenre') === 'Article Text' ? 'Issue' : 'Catalog Entry';
	const authorName = Cypress.env('defaultGenre') === 'Article Text' ? 'Woods' : 'Power';

	it('Assign category to submission', function() {
		const categoryLabel = 'Test Category';

		// Step 1: Add a new category
		cy.login('dbarnes');
		cy.visit('index.php/publicknowledge/management/settings/context#categories');
		cy.addCategory(categoryLabel, 'test-category');


		// Assign the category to the submission
		cy.visit('/index.php/publicknowledge/en/dashboard/editorial?currentViewId=active');
		cy.findSubmissionAsEditor('dbarnes', null, authorName);
		cy.openWorkflowMenu(workflowMenu);

		cy.contains('label', categoryLabel)
			.find('input[type="checkbox"]')
			.check();


		cy.get('button').contains('Save').click();
		cy.contains('[data-cy="active-modal"] button', 'Close').click();

		// Verify that category was assigned to the submission
		cy.findSubmissionAsEditor('dbarnes', null, authorName);
		cy.openWorkflowMenu(workflowMenu);

		cy.contains('label', categoryLabel)
			.find('input[type="checkbox"]')
			.should('be.checked');
	});

	it('Unassign category from submission', function() {
		const categoryLabel = 'Test Category';
		// Login and navigate to the submission
		cy.login('dbarnes');
		cy.visit('/index.php/publicknowledge/en/dashboard/editorial?currentViewId=active');
		cy.findSubmissionAsEditor('dbarnes', null, authorName);
		cy.openWorkflowMenu(workflowMenu);

		// Unassign the category from the submission
		cy.contains('label', categoryLabel)
			.find('input[type="checkbox"]')
			.uncheck();

		cy.get('button').contains('Save').click();
		cy.contains('[data-cy="active-modal"] button', 'Close').click();

		// Verify that the category was unassigned from the submission
		cy.findSubmissionAsEditor('dbarnes', null, authorName);
		cy.openWorkflowMenu(workflowMenu);

		cy.contains('label', categoryLabel)
			.find('input[type="checkbox"]')
			.should('not.be.checked');
	});

	it('Deletes a category along with its sub-categories, and unassign submission', function() {
		const categoryLabel = 'Applied Science';
		const subCategoryLabel = 'Applied Science > Computer Science > Computer Vision';
		cy.login('dbarnes');

		// Assign the category and sub-category to the submission
		cy.visit('/index.php/publicknowledge/en/dashboard/editorial?currentViewId=active');
		cy.findSubmissionAsEditor('dbarnes', null, authorName);
		cy.openWorkflowMenu(workflowMenu);

		cy.contains('label', categoryLabel)
			.find('input[type="checkbox"]')
			.check();

		cy.contains('label', subCategoryLabel)
			.find('input[type="checkbox"]')
			.check();

		cy.contains('label', 'Applied Science > Computer Science')
			.find('input[type="checkbox"]')
			.check();

		cy.get('button').contains('Save').click();
		cy.contains('[data-cy="active-modal"] button', 'Close').click();

		// Verify that categories are assigned to the submission
		cy.findSubmissionAsEditor('dbarnes', null, authorName);
		cy.openWorkflowMenu(workflowMenu);

		cy.contains('label', categoryLabel)
			.find('input[type="checkbox"]')
			.should('be.checked');

		cy.contains('label', subCategoryLabel)
			.find('input[type="checkbox"]')
			.should('be.checked');

		// Go to category page and delete the category
		cy.visit('index.php/publicknowledge/management/settings/context#categories');

		cy.contains('tr', categoryLabel)
			.find('button[aria-label="More Actions"]')
			.click()
			.then(() => {
				cy.get('div[role="menuitem"]')
					.contains('button', 'Delete Category')
					.click();
			});

		cy.get('[data-cy="dialog"]').find('input.pkpFormField--text__input').type(categoryLabel);
		cy.contains('button', 'I understand the consequences, delete this category').click();
		cy.contains('Category Deleted');

		// Navigate back to the submission and verify category and its sub-categories are unassigned
		cy.visit('/index.php/publicknowledge/en/dashboard/editorial?currentViewId=active');

		cy.findSubmissionAsEditor('dbarnes', null, authorName);
		cy.openWorkflowMenu(workflowMenu);

		cy.get('label:contains("' + categoryLabel + '")').should('not.exist');
		cy.get('label:contains("' + subCategoryLabel + '")').should('not.exist');
	});
});
