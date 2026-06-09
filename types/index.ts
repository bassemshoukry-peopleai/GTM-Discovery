export interface Session {
  id: string
  consultant_id: string
  consultant_email: string
  consultant_name: string | null
  customer_name: string
  customer_email: string
  status: 'pending' | 'submitted' | 'complete' | 'error'
  created_at: string
  submitted_at: string | null
  completed_at: string | null
}

export interface FormData {
  // Foundation
  userRoles: string[]
  otherRoles: string
  hasGeographies: string
  geographies: string
  hasSegments: string
  segments: string
  // Accounts
  accountOwnerRoles: string[]
  accountOwner: string
  usesAccountTeams: string[]
  customAccountFields: string[]
  accountTypes: string[]
  accountRecordTypes: string[]
  excludeAccountTypes: string
  hasPartnerSelling: string
  partnerDefinition: string
  // Opportunities
  oppCreation: string
  usesContactRoles: string
  oppsPerAccount: string
  oppOwnerRoles: string[]
  oppOwner: string
  usesOppTeams: string
  customOppFields: string[]
  oppTypes: string[]
  oppRecordTypes: string[]
  excludeOppTypes: string
  // Contacts & Leads
  usesLeads: string
  leadEngagerRoles: string[]
  leadCreation: string
  // Tech
  otherTools: string
  sfValidations: string
  activityLoggingTools: string
  activityLoggingToolsDetail: string
  manualLogging: string
  manualFields: string
}

export interface EligibilityFilter {
  name: string
  object: string
  rule: string
  reason: string
}

export interface RankingGroup {
  name: string
  object: string
  type: string
  condition: string
  reason: string
}

export interface ProfileRecommendation {
  name: string
  targetRoles: string[]
  reason: string
  settings: {
    intakeData: boolean
    transcriptIntake: boolean
    displayData: boolean
    pushData: boolean
    emailSync: boolean
    meetingSync: boolean
    contactCreation: boolean
    contactRoleCreation: boolean
  }
  eligibilityFilters: EligibilityFilter[]
  rankingGroups: RankingGroup[]
  notificationSetting: string
  specialConsiderations: string[]
}

export interface Recommendations {
  profileCount: number
  profiles: ProfileRecommendation[]
  partnerConfig: {
    needed: boolean
    fieldValues: string[]
    reason: string
  }
  syncWithoutWho: {
    recommended: boolean
    reason: string
  }
  globalNotes: string[]
}
