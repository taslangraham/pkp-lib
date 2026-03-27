{**
 * templates/admin/confirmAccess.tpl
 *
 * Copyright (c) 2026 Simon Fraser University
 * Copyright (c) 2026 John Willinsky
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * Display page prompting Admin to enter password to access Adminstration area of the application
 *}
{extends file="layouts/backend.tpl"}
{block name="page"}
	<confirm-access-page v-bind="pageInitConfig"></confirm-access-page>
{/block}
