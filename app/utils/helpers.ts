// Function to convert case analysis JSON to markdown
export const convertAnalysisToMarkdown = (analysisData: any) => {
    if (!analysisData) return "";

    return `
## Case Information
- **Court:** ${analysisData.court}
- **Location:** ${analysisData.location}
- **Date of Judgment:** ${analysisData.date_of_judgment}
- **Type of Decision:** ${analysisData.type_of_decision}

## Judicial Panel
- **Opinion by:** ${analysisData.opinion_by}
- **Nature of Vote:** ${analysisData.nature_of_vote}
- **Panel Members:**
${analysisData.coram?.map((judge: string) => ` - ${judge}`).join('\n') || '  - Information not available'}

## Representation
${analysisData.counsel?.map((counsel: string) => `- ${counsel}`).join('\n') || '- Information not available'}

## Case Classification
- **Category:** ${analysisData.category_of_case || 'Not specified'}
- **Areas of Law:** ${analysisData.area_of_law?.join(', ') || 'Not specified'}
- **Subject Index:** ${analysisData.subject_index?.join(', ') || 'Not specified'}
- **Catchwords:** ${analysisData.catchwords?.join(', ') || 'Not specified'}

## Case Summary
${analysisData.summary_of_facts || 'No summary available.'}

## Procedural History
${analysisData.procedural_history || 'Not provided.'}

## Issues for Determination
${analysisData.issues_for_determination?.map((issue: string) => `- ${issue}`).join('\n') || '- Not specified'}

## Legal Arguments
${analysisData.legal_arguments || 'Not provided.'}

## Holding
${analysisData.holding?.map((point: string) => `- ${point}`).join('\n') || '- Not specified'}

## Ratio Decidendi (Reasoning)
${analysisData.ratio_decidendi || 'Not provided.'}

${analysisData.obiter_dictum ? `## Obiter Dictum\n${analysisData.obiter_dictum}` : ''}

${analysisData.important_quotes?.length > 0 ? `## Key Quotes\n${analysisData.important_quotes.map((quote: string) => `> ${quote}`).join('\n\n')}` : ''}

## Orders and Remedies
${analysisData.orders_and_remedies || 'Not specified.'}

## References
${analysisData.cases_cited?.length > 0 ? `### Cases Cited\n${analysisData.cases_cited.map((cs: string) => `- ${cs}`).join('\n')}` : ''}

${analysisData.legal_rules_referenced?.length > 0 ? `### Legislation Referenced\n${analysisData.legal_rules_referenced.map((rule: string) => `- ${rule}`).join('\n')}` : ''}

${analysisData.books_journals_cited?.length > 0 ? `### Academic Literature\n${analysisData.books_journals_cited.map((book: string) => `- ${book}`).join('\n')}` : ''}

## Commentary
${analysisData.commentary || 'No further commentary available.'}`;
};
