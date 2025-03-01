import { ARCHIVE_EVENT } from "./archiveEvent.mutation";
import { CHANGE_USER_PRIMARY_ROLE } from "./changeUserPrimaryRole.mutation";
import { CREATE_ACCESS_KEY } from "./createAccessKey.mutation";
import { CREATE_CONTENT_CONTAINER } from "./createContentContainer.mutation";
import { CREATE_EVENT } from "./createEvent.mutation";
import { CREATE_EVENT_CHANNEL } from "./createEventChannel.mutation";
import { CREATE_RESOURCE } from "./createResource.mutation";
import { CREATE_ROLE } from "./createRole.mutation";
import { DELETE_ACCESS_KEY } from "./deleteAccessKey.mutation";
import { DELETE_CONTENT_CONTAINER } from "./deleteContentContainer.mutation";
import { DELETE_CONTENT_CONTAINER_FILE } from "./deleteContentContainerFile.mutation";
import { DELETE_CURRENT_USER } from "./deleteCurrentUser.mutation";
import { DELETE_EVENT } from "./deleteEvent.mutation";
import { DELETE_EVENT_CHANNEL } from "./deleteEventChannel.mutation";
import { DELETE_RESOURCE } from "./deleteResource.mutation";
import { DELETE_ROLE } from "./deleteRole.mutation";
import { EDIT_ACCESS_KEY } from "./editAccessKey.mutation";
import { EDIT_CONTENT_CONTAINER } from "./editContentContainer.mutation";
import { EDIT_CONTENT_CONTAINER_FILE } from "./editContentContainerFile.mutation";
import { EDIT_EVENT } from "./editEvent.mutation";
import { EDIT_EVENT_CHANNEL } from "./editEventChannel.mutation";
import { EDIT_RESOURCE } from "./editResource.mutation";
import { EDIT_ROLE } from "./editRole.mutation";
import { EDIT_SYSTEM_SETTINGS } from "./editSystemSettings.mutation";
import { END_EVENT } from "./endEvent.mutation";
import { GIVE_USER_ROLE } from "./giveUserRole.mutation";
import { KICK_EVENT_MEMBER } from "./kickEventMember.mutation";
import { POST_EVENT } from "./postEvent.mutation";
import { REGENERATE_ACCESS_KEY } from "./regenerateAccessKey.mutation";
import { REMOVE_USER_ROLE } from "./removeUserRole.mutation";
import { REORDER_ROLES } from "./reorderRoles.mutation";
import { RSVP_FOR_EVENT } from "./rsvpForEvent.mutation";
import { UNRSVP_FOR_EVENT } from "./unrsvpForEvent.mutation";

export const Mutations = {
	DELETE_CURRENT_USER,
	CREATE_EVENT,
	EDIT_EVENT,
	POST_EVENT,
	END_EVENT,
	ARCHIVE_EVENT,
	DELETE_EVENT,
	RSVP_FOR_EVENT,
	UNRSVP_FOR_EVENT,
	KICK_EVENT_MEMBER,
	CREATE_EVENT_CHANNEL,
	EDIT_EVENT_CHANNEL,
	DELETE_EVENT_CHANNEL,
	CREATE_ROLE,
	EDIT_ROLE,
	DELETE_ROLE,
	REORDER_ROLES,
	GIVE_USER_ROLE,
	REMOVE_USER_ROLE,
	CHANGE_USER_PRIMARY_ROLE,
	CREATE_RESOURCE,
	EDIT_RESOURCE,
	DELETE_RESOURCE,
	EDIT_SYSTEM_SETTINGS,
	CREATE_ACCESS_KEY,
	EDIT_ACCESS_KEY,
	REGENERATE_ACCESS_KEY,
	DELETE_ACCESS_KEY,
	CREATE_CONTENT_CONTAINER,
	EDIT_CONTENT_CONTAINER,
	DELETE_CONTENT_CONTAINER,
	EDIT_CONTENT_CONTAINER_FILE,
	DELETE_CONTENT_CONTAINER_FILE
};
