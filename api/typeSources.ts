/**
 * Project
 */

export type ClientErrorProjectNameAlreadyTaken = ClientError & {
  __typename: 'ClientErrorProjectNameAlreadyTaken'
}

export type ClientErrorProjectNameInvalid = ClientError & {
  __typename: 'ClientErrorProjectNameInvalid'
}

export type ClientErrorNotAuthorized = ClientError & {
  __typename: 'ClientErrorNotAuthorized'
}

/**
 * Workspace
 */

export type ClientErrorWorkspaceNameAlreadyTaken = ClientError & {
  __typename: 'ClientErrorWorkspaceNameAlreadyTaken'
}

export type ClientErrorWorkspaceNameInvalid = ClientError & {
  __typename: 'ClientErrorProjectNameInvalid'
}

/**
 * Generic
 */

export type ClientErrorNameAlreadyTaken = ClientError & {
  __typename: 'ClientErrorNameAlreadyTaken'
}

export type ClientErrorNameInvalid = ClientError & {
  __typename: 'ClientErrorNameInvalid'
}

export type ClientErrorWorkspaceNotFound = ClientError & {
  __typename: 'ClientErrorWorkspaceNotFound'
}

/**
 * Base
 */

export type ClientError = {
  __typename: string
  message: string
  path: null | string[]
}
