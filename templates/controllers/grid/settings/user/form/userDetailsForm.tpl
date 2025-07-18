{**
 * templates/controllers/grid/settings/user/form/userDetailsForm.tpl
 *
 * Copyright (c) 2014-2021 Simon Fraser University
 * Copyright (c) 2003-2021 John Willinsky
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * Form for creating/editing a user.
 *}

<script type="text/javascript">
	$(function() {ldelim}
		// Attach the form handler.
		$('#userDetailsForm').pkpHandler('$.pkp.controllers.grid.settings.user.form.UserDetailsFormHandler',
			{ldelim}
				fetchUsernameSuggestionUrl: {url|json_encode router=PKP\core\PKPApplication::ROUTE_COMPONENT component="api.user.UserApiHandler" op="suggestUsername" givenName="GIVEN_NAME_PLACEHOLDER" familyName="FAMILY_NAME_PLACEHOLDER" escape=false},
				usernameSuggestionTextAlert: {translate|json_encode key="grid.user.mustProvideName"}
			{rdelim}
		);
	{rdelim});
</script>

{if !$userId}
	{assign var="passwordRequired" value="true"}
{/if}{* !$userId *}

<form class="pkp_form" id="userDetailsForm" method="post" action="{url router=PKP\core\PKPApplication::ROUTE_COMPONENT component="grid.settings.user.UserGridHandler" op="updateUser"}">
	{csrf}
	<input type="hidden" id="sitePrimaryLocale" name="sitePrimaryLocale" value="{$sitePrimaryLocale|escape}" />
	<div id="userDetailsFormContainer">
		<div id="userDetails" class="full left">
			{if !$userGroupUpdateOnly}
				{if $userId}
					<h3>{translate key="grid.user.userDetails"}</h3>
				{else}
					<h3>{translate key="grid.user.step1"}</h3>
				{/if}
			{/if}
			{if $userId}
				<input type="hidden" id="userId" name="userId" value="{$userId|escape}" />
			{/if}
			{include file="controllers/notification/inPlaceNotification.tpl" notificationId="userDetailsFormNotification"}
		</div>

		{if !$userGroupUpdateOnly}
			{if $userId}
				{assign var="disableSendNotifySection" value=true}
			{/if}

			{include
				file="common/userDetails.tpl"
				disableSendNotifySection=$disableSendNotifySection
			}

			{if $canCurrentUserGossip}
				{fbvFormSection label="user.gossip" description="user.gossip.description"}
					{fbvElement type="textarea" name="gossip" id="gossip" rich=true value=$gossip}
				{/fbvFormSection}
			{/if}
		{/if}

		{if $userGroupUpdateOnly}
			{include file="common/userDetailsReadOnly.tpl"}
		{/if}

		{if $userId}
			{fbvFormSection}
				{fbvFormSection list=true title="grid.user.userRoles"}
					{foreach from=$allUserGroups item="userGroup" key="id"}
						{fbvElement type="checkbox" id="userGroupIds[]" value=$id checked=in_array($id, $assignedUserGroups) label=$userGroup|escape translate=false}
					{/foreach}
				{/fbvFormSection}
			{/fbvFormSection}
			{fbvFormSection}
				{fbvFormSection list=true title="grid.user.userRoles.masthead"}
					{foreach from=$defaultMastheadUserGroups item="mastheadUserGroup" key="id"}
						{fbvElement type="checkbox" id="mastheadUserGroupIds[]" value=$id checked=!in_array($id, $notOnMastheadUserGroupIds) label=$mastheadUserGroup|escape translate=false disabled=in_array($id, $reviewerUserGroupIds)}
					{/foreach}
				{/fbvFormSection}
			{/fbvFormSection}
		{/if}
		<p><span class="formRequired">{translate key="common.requiredField"}</span></p>
		{fbvFormButtons}
	</div>
</form>
