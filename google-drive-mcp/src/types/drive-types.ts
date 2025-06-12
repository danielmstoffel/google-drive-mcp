export interface SharedDrive {
  id: string;
  name: string;
  themeId?: string;
  colorRgb?: string;
  backgroundImageFile?: any;
  backgroundImageLink?: string;
  capabilities?: {
    canAddChildren?: boolean;
    canChangeDriveBackground?: boolean;
    canChangeDriveMembersOnlyRestriction?: boolean;
    canComment?: boolean;
    canCopy?: boolean;
    canDeleteDrive?: boolean;
    canDownload?: boolean;
    canEdit?: boolean;
    canListChildren?: boolean;
    canManageMembers?: boolean;
    canReadRevisions?: boolean;
    canRename?: boolean;
    canRenameDrive?: boolean;
    canShare?: boolean;
  };
  createdTime?: string;
  hidden?: boolean;
  restrictions?: {
    adminManagedRestrictions?: boolean;
    copyRequiresWriterPermission?: boolean;
    domainUsersOnly?: boolean;
    driveMembersOnly?: boolean;
  };
}
