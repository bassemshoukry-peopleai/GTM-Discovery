import Anthropic from '@anthropic-ai/sdk'
import { FormData, Recommendations } from '@/types'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are a Backstory (People.ai) implementation specialist. Given customer GTM discovery responses, output a JSON configuration recommendation.

Key Backstory matching knowledge:
- Matching signals: account name, account domain, account contacts, account/opportunity owner, opportunity contact roles
- Confidence scoring: cumulative score across ALL signals; the record with the highest score wins by default. Score-based matching already factors in ownership, open opportunity status, and contact associations — these do NOT need to be replicated as ranking rules.
- Default behavior is score descending — this is almost always correct and needs no configuration.
- CRM sync order: 1) Contact match → find related Account or open Opportunity, 2) Lead exact email match, 3) Account domain match + create Contact (if Contact Creation enabled)
- Configuration Profiles: group users; control Intake Data, Transcript Intake, Display Data, Push Data, Email Sync, Meeting Sync, Contact Creation, Contact Role Creation toggles
- Eligibility Filter Groups: define which CRM records are eligible; multiple groups for same object use OR logic. Use to EXCLUDE records that should never be matched.
- Ranking Groups: ONLY recommend when there is a specific business reason to select a LOWER-scoring record over a HIGHER-scoring one. This is rare. Valid examples: always prefer Lead over Opp for BDRs; always prefer soonest renewal by close date. Do NOT add ranking groups to replicate what score-based matching already does. If default score ordering is correct, leave rankingGroups as [].
- If multiple profiles have identical settings, consolidate into one profile.
- Partner matching: configurable field values for Account.Type and Account.RecordType
- Sync Without "Who": enables syncing to account only (no contact/lead required)

Return ONLY valid compact JSON (no markdown, no backticks) matching exactly this schema:
{"profileCount":0,"profiles":[{"name":"","targetRoles":[],"reason":"","settings":{"intakeData":true,"transcriptIntake":true,"displayData":true,"pushData":true,"emailSync":true,"meetingSync":true,"contactCreation":true,"contactRoleCreation":true},"eligibilityFilters":[{"name":"","object":"","rule":"","reason":""}],"rankingGroups":[{"name":"","object":"","type":"","condition":"","reason":""}],"notificationSetting":"","specialConsiderations":[]}],"partnerConfig":{"needed":false,"fieldValues":[],"reason":""},"syncWithoutWho":{"recommended":false,"reason":""},"globalNotes":[]}`

function buildUserPrompt(data: FormData): string {
  return `Discovery responses:

ROLES: ${[...data.userRoles, data.otherRoles].filter(Boolean).join(', ') || 'Not specified'}
GEOGRAPHIES: ${data.hasGeographies === 'Yes' ? data.geographies : 'None'}
SEGMENTS: ${data.hasSegments === 'Yes' ? data.segments : 'None'}
ACCOUNT OWNERS: ${(data.accountOwnerRoles || []).join(', ') || 'Not specified'}${data.accountOwner ? ' (' + data.accountOwner + ')' : ''}
ACCOUNT TEAMS: ${data.usesAccountTeams || 'Not specified'}
CUSTOM ACCOUNT FIELDS: ${data.customAccountFields.join(', ') || 'None'}
ACCOUNT TYPES: ${data.accountTypes.join(', ') || 'None'}
ACCOUNT RECORD TYPES: ${data.accountRecordTypes.join(', ') || 'None'}
EXCLUDE ACCOUNT TYPES: ${data.excludeAccountTypes || 'None'}
PARTNER SELLING: ${data.hasPartnerSelling === 'Yes' ? 'Yes — ' + data.partnerDefinition : data.hasPartnerSelling || 'Not specified'}
OPP CREATION: ${data.oppCreation || 'Not specified'}
CONTACT ROLES: ${data.usesContactRoles || 'Not specified'}
OPPS PER ACCOUNT: ${data.oppsPerAccount || 'Not specified'}
OPP OWNERS: ${(data.oppOwnerRoles || []).join(', ') || 'Not specified'}${data.oppOwner ? ' (' + data.oppOwner + ')' : ''}
OPP TEAMS: ${data.usesOppTeams || 'Not specified'}
CUSTOM OPP FIELDS: ${data.customOppFields.join(', ') || 'None'}
OPP TYPES: ${data.oppTypes.join(', ') || 'None'}
OPP RECORD TYPES: ${data.oppRecordTypes.join(', ') || 'None'}
EXCLUDE OPP TYPES: ${data.excludeOppTypes || 'None'}
LEAD USAGE: ${data.usesLeads || 'Not specified'}
LEAD ENGAGERS: ${(data.leadEngagerRoles || []).join(', ') || 'Not specified'}
LEAD CREATION: ${data.leadCreation || 'Not specified'}
OTHER TOOLS: ${data.otherTools || 'None'}
ACTIVITY LOGGING TOOLS: ${data.activityLoggingTools || 'Not specified'}${data.activityLoggingToolsDetail ? ' (' + data.activityLoggingToolsDetail + ')' : ''}
SF VALIDATIONS: ${data.sfValidations || 'None'}
MANUAL LOGGING: ${data.manualLogging || 'Not specified'}
MANUAL FIELDS: ${data.manualFields || 'None'}`
}

export async function generateRecommendations(formData: FormData): Promise<Recommendations> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(formData) }],
  })

  const raw = message.content
    .filter(b => b.type === 'text')
    .map(b => (b as any).text)
    .join('')

  const clean = raw.replace(/```json\n?|```\n?/g, '').trim()
  return JSON.parse(clean) as Recommendations
}
