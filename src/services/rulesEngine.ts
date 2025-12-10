import { Campaign } from '../types';

export type RuleAction = 'pause' | 'increase_budget' | 'decrease_budget' | 'alert' | 'enable';

export interface CampaignRule {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    condition: (campaign: Campaign) => Promise<boolean> | boolean;
    action: RuleAction;
    reason: string;
    priority: number;
}

export interface RuleEvaluationResult {
    campaign: Campaign;
    ruleName: string;
    action: RuleAction;
    reason: string;
    timestamp: number;
}

export class CampaignRulesEngine {
    private rules: CampaignRule[] = [];

    constructor(rules?: CampaignRule[]) {
        if (rules) {
            this.rules = rules;
        }
    }

    addRule(rule: CampaignRule): void {
        this.rules.push(rule);
        this.rules.sort((a, b) => b.priority - a.priority);
    }

    removeRule(ruleId: string): void {
        this.rules = this.rules.filter(r => r.id !== ruleId);
    }

    toggleRule(ruleId: string, enabled: boolean): void {
        const rule = this.rules.find(r => r.id === ruleId);
        if (rule) {
            rule.enabled = enabled;
        }
    }

    getRules(): CampaignRule[] {
        return [...this.rules];
    }

    async evaluate(campaigns: Campaign[]): Promise<RuleEvaluationResult[]> {
        const results: RuleEvaluationResult[] = [];

        for (const campaign of campaigns) {
            for (const rule of this.rules) {
                if (!rule.enabled) continue;

                try {
                    const matches = await rule.condition(campaign);
                    if (matches) {
                        results.push({
                            campaign,
                            ruleName: rule.name,
                            action: rule.action,
                            reason: rule.reason,
                            timestamp: Date.now()
                        });
                    }
                } catch (error) {
                    console.error(`Rule evaluation error for ${rule.name}:`, error);
                }
            }
        }

        return results;
    }

    async evaluateSingle(campaign: Campaign): Promise<RuleEvaluationResult[]> {
        return this.evaluate([campaign]);
    }
}

export const DEFAULT_RULES: CampaignRule[] = [
    {
        id: 'kill-low-roas',
        name: 'Kill Low ROAS Campaigns',
        description: 'Pause campaigns with ROAS below 0.8x after significant spend',
        enabled: true,
        condition: (c) => c.roas < 0.8 && c.spend > 1000,
        action: 'pause',
        reason: 'ROAS below 0.8x with spend over $1,000',
        priority: 100
    },
    {
        id: 'scale-high-performers',
        name: 'Scale High Performers',
        description: 'Increase budget for campaigns with exceptional ROAS',
        enabled: true,
        condition: (c) => c.roas > 3.0 && c.spend < 5000 && c.status === 'Active',
        action: 'increase_budget',
        reason: 'Exceptional ROAS (>3.0x) with room to scale',
        priority: 90
    },
    {
        id: 'alert-declining-performance',
        name: 'Alert on Declining Performance',
        description: 'Alert when ROAS drops significantly',
        enabled: true,
        condition: (c) => c.roas < 1.5 && c.roas > 0.8 && c.spend > 500,
        action: 'alert',
        reason: 'ROAS declining but still profitable - monitor closely',
        priority: 80
    },
    {
        id: 'reduce-budget-mediocre',
        name: 'Reduce Budget on Mediocre Campaigns',
        description: 'Decrease budget for campaigns with average performance',
        enabled: true,
        condition: (c) => c.roas >= 1.0 && c.roas < 1.5 && c.spend > 2000,
        action: 'decrease_budget',
        reason: 'Mediocre ROAS - reallocate budget to better performers',
        priority: 70
    },
    {
        id: 'revive-paused-potential',
        name: 'Revive Paused High-Potential',
        description: 'Re-enable paused campaigns with historical good ROAS',
        enabled: false,
        condition: (c) => c.status === 'Paused' && c.roas > 2.0,
        action: 'enable',
        reason: 'Historical ROAS suggests potential - consider re-enabling',
        priority: 60
    },
    {
        id: 'zero-conversions-alert',
        name: 'Zero Conversions Alert',
        description: 'Alert when active campaign has no conversions',
        enabled: true,
        condition: (c) => c.status === 'Active' && c.chronosTrackedSales === 0 && c.spend > 100,
        action: 'alert',
        reason: 'No tracked conversions despite active spend',
        priority: 95
    },
    {
        id: 'high-spend-low-leads',
        name: 'High Spend Low Leads',
        description: 'Pause campaigns with high spend but very few leads',
        enabled: true,
        condition: (c) => c.spend > 500 && c.leads < 5 && c.status === 'Active',
        action: 'pause',
        reason: 'High spend ($500+) with less than 5 leads',
        priority: 85
    }
];

let rulesEngineInstance: CampaignRulesEngine | null = null;

export const getRulesEngine = (): CampaignRulesEngine => {
    if (!rulesEngineInstance) {
        rulesEngineInstance = new CampaignRulesEngine(DEFAULT_RULES);
    }
    return rulesEngineInstance;
};
