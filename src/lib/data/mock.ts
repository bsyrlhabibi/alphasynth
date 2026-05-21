import { Opportunity, Signal } from "@/lib/types";

export const mockSignals: Signal[] = [
  {
    id: "sig-1",
    source: "Base Mainnet",
    sourceType: "onchain",
    title: "New Contract Deployed with Proxy Pattern",
    description:
      "0xAlphaDev deployed a new UUPS proxy contract on Base. Contract initialization included a 72h timelock and treasury vesting schedule.",
    rawData: {
      deployer: "0xAlphaDev",
      contract: "0x742d...88f1",
      gasUsed: 2847000,
      pattern: "UUPS Proxy + Vesting",
    },
    timestamp: "2026-05-21T14:30:00Z",
  },
  {
    id: "sig-2",
    source: "Etherscan",
    sourceType: "onchain",
    title: "$50M USDC Bridge Deposit to New L2",
    description:
      "Whale wallet 0xWhale... transferred 50M USDC into a newly announced L2 bridge contract that has not been officially launched yet.",
    rawData: {
      value: "50000000",
      token: "USDC",
      bridge: "0xBridge...a1b2",
      from: "0xWhale...",
    },
    timestamp: "2026-05-21T12:15:00Z",
  },
  {
    id: "sig-3",
    source: "X/Twitter",
    sourceType: "social",
    title: "Core Dev Hinted at Token Launch",
    description:
      "Lead developer posted cryptic tweet with smart contract address fragment matching Base deployment. Thread deleted within 15 minutes.",
    rawData: {
      handle: "@basebuilder",
      followers: 45000,
      engagement: 12000,
      deleted: true,
    },
    timestamp: "2026-05-21T13:00:00Z",
  },
  {
    id: "sig-4",
    source: "GitHub",
    sourceType: "github",
    title: "Public Repo Reveals Airdrop Eligibility Contract",
    description:
      "GitHub repo 'protocol-labs/airdrop' pushed commit with Merkle distributor contract and snapshot date: June 1st.",
    rawData: {
      repo: "protocol-labs/airdrop",
      commit: "a1b2c3d",
      files: ["MerkleDistributor.sol", "eligibility.json"],
    },
    timestamp: "2026-05-21T10:45:00Z",
  },
  {
    id: "sig-5",
    source: "Arbitrum Nova",
    sourceType: "onchain",
    title: "Suspicious Flash Loan Pattern Detected",
    description:
      "Multi-step flash loan involving 3 DEXs and price oracle manipulation detected. No exploit executed yet — likely probe.",
    rawData: {
      value: "2500000",
      steps: 8,
      protocols: ["Uniswap", "SushiSwap", "Balancer"],
      profit: "0",
    },
    timestamp: "2026-05-21T16:00:00Z",
  },
  {
    id: "sig-6",
    source: "Docs Portal",
    sourceType: "docs",
    title: "Bridge Docs Updated with 'Native Token' Section",
    description:
      "Official documentation added new page describing bridge fee mechanism using a native token. Page was not indexed by search engines yet.",
    rawData: {
      url: "docs.example.com/bridge/token",
      changes: ["fee-model", "tokenomics", "staking"],
    },
    timestamp: "2026-05-21T09:20:00Z",
  },
];

export const mockOpportunities: Opportunity[] = [
  {
    id: "opp-1",
    title: "Stealth Infrastructure Token Launch on Base",
    category: "Token Launch",
    chain: "Base",
    signals: [mockSignals[0], mockSignals[2], mockSignals[3], mockSignals[5]],
    agentOutputs: [
      {
        agent: "Scout",
        confidence: 94,
        conclusion:
          "4 convergent signals across on-chain, social, GitHub, and docs. Strong pattern match for orchestrated stealth launch.",
        tags: ["stealth-launch", "base", "infrastructure"],
        reasoning: [
          {
            step: 1,
            agent: "Scout",
            observation:
              "New contract deployed with proxy pattern and vesting on Base.",
            hypothesis: "This is a production launch, not a test.",
            confidence: 85,
          },
          {
            step: 2,
            agent: "Scout",
            observation:
              "Dev deleted tweet containing contract fragment within 15 min.",
            hypothesis: "Accidental leak — signals human error in stealth campaign.",
            confidence: 90,
          },
          {
            step: 3,
            agent: "Scout",
            observation: "GitHub repo pushed Merkle distributor + snapshot date.",
            hypothesis: "Airdrop snapshot confirmed. June 1st deadline.",
            confidence: 95,
          },
        ],
      },
      {
        agent: "Analyst",
        confidence: 89,
        conclusion:
          "Infrastructure play with strong tokenomics design. Vesting + timelock indicates long-term alignment.",
        tags: ["infrastructure", "airdrop", "vesting"],
        reasoning: [
          {
            step: 1,
            agent: "Analyst",
            observation:
              "Contract uses UUPS proxy with 72h timelock.",
            hypothesis:
              "Team prioritizes upgrade safety and governance delay.",
            confidence: 88,
          },
          {
            step: 2,
            agent: "Analyst",
            observation:
              "Vesting schedule embedded in initialization.",
            hypothesis:
              "Team tokens locked. Reduced dump risk at TGE.",
            confidence: 92,
          },
          {
            step: 3,
            agent: "Analyst",
            observation:
              "Docs added bridge fee token model before announcement.",
            hypothesis:
              "Token has clear utility: bridge fee payment. Not pure speculation.",
            confidence: 85,
          },
        ],
      },
      {
        agent: "Risk",
        confidence: 82,
        conclusion:
          "Low smart contract risk. Forked from audited OpenZeppelin base with minimal modifications. Unknown team doxxing risk remains.",
        tags: ["low-risk", "audited-patterns", "unknown-team"],
        reasoning: [
          {
            step: 1,
            agent: "Risk",
            observation:
              "Contract bytecode matches OpenZeppelin UUPS proxy standard.",
            hypothesis: "No custom logic in proxy — lower attack surface.",
            confidence: 95,
          },
          {
            step: 2,
            agent: "Risk",
            observation:
              "Only 2 modifications in implementation vs OZ standard.",
            hypothesis:
              "Changes reviewed: access control + emergency pause. Both standard.",
            confidence: 85,
          },
          {
            step: 3,
            agent: "Risk",
            observation:
              "Deployer wallet funded via Tornado Cash 6 months ago.",
            hypothesis:
              "Anonymity-seeking behavior. Could be privacy-conscious or malicious.",
            confidence: 60,
          },
        ],
      },
      {
        agent: "Synthesize",
        confidence: 87,
        conclusion:
          "High-confidence stealth infrastructure launch. Airdrop snapshot June 1st. Recommended action: Monitor wallet for eligibility and prepare for TGE.",
        tags: ["high-conviction", "airdrop", "tge-prep"],
        reasoning: [
          {
            step: 1,
            agent: "Synthesize",
            observation:
              "Scout: 94% confidence on 4 convergent signals.",
            hypothesis: "Signal cluster is not coincidence.",
            confidence: 94,
          },
          {
            step: 2,
            agent: "Synthesize",
            observation:
              "Analyst: Token has utility (bridge fees) + vesting alignment.",
            hypothesis:
              "Fundamental quality score is above average for stealth launches.",
            confidence: 89,
          },
          {
            step: 3,
            agent: "Synthesize",
            observation:
              "Risk: Low contract risk, but anonymous deployer.",
            hypothesis:
              "Risk-adjusted confidence: 87%. Within acceptable range.",
            confidence: 87,
          },
        ],
      },
    ],
    finalScore: 87,
    finalConfidence: 87,
    action: "Monitor",
    riskLevel: "Low",
    timestamp: "2026-05-21T14:30:00Z",
  },
  {
    id: "opp-2",
    title: "Whale Bridge Deposit into Pre-Launch L2",
    category: "Smart Money Move",
    chain: "Arbitrum",
    signals: [mockSignals[1]],
    agentOutputs: [
      {
        agent: "Scout",
        confidence: 78,
        conclusion:
          "Large whale deposit into unannounced L2 bridge. Isolated signal but high capital concentration.",
        tags: ["whale-move", "bridge", "pre-launch"],
        reasoning: [
          {
            step: 1,
            agent: "Scout",
            observation: "50M USDC deposited into bridge contract.",
            hypothesis: "Whale has insider knowledge of upcoming L2 launch.",
            confidence: 75,
          },
        ],
      },
      {
        agent: "Analyst",
        confidence: 65,
        conclusion:
          "Single-signal play. Whale could be market maker or early investor. Insufficient data for conviction.",
        tags: ["insufficient-data", "single-signal"],
        reasoning: [
          {
            step: 1,
            agent: "Analyst",
            observation: "Only one signal: whale deposit.",
            hypothesis:
              "Without additional signals (social, docs, GitHub), this is a low-conviction trade.",
            confidence: 65,
          },
        ],
      },
      {
        agent: "Risk",
        confidence: 70,
        conclusion:
          "Bridge contract unaudited. Funds at risk if contract is malicious or buggy.",
        tags: ["unaudited", "bridge-risk"],
        reasoning: [
          {
            step: 1,
            agent: "Risk",
            observation: "Bridge contract not verified on Etherscan.",
            hypothesis: "Opaque code. Cannot assess security without analysis.",
            confidence: 60,
          },
        ],
      },
      {
        agent: "Synthesize",
        confidence: 68,
        conclusion:
          "Moderate-confidence smart money signal. Recommend following whale wallet for additional clues. Do not bridge funds yet.",
        tags: ["follow-wallet", "low-conviction"],
        reasoning: [
          {
            step: 1,
            agent: "Synthesize",
            observation: "Scout 78% + Analyst 65% + Risk 70%.",
            hypothesis:
              "Aggregated confidence pulled down by insufficient signal diversity.",
            confidence: 68,
          },
        ],
      },
    ],
    finalScore: 68,
    finalConfidence: 68,
    action: "Research",
    riskLevel: "Medium",
    timestamp: "2026-05-21T12:15:00Z",
  },
  {
    id: "opp-3",
    title: "Flash Loan Probe — Potential Exploit Setup",
    category: "Security Alert",
    chain: "Arbitrum Nova",
    signals: [mockSignals[4]],
    agentOutputs: [
      {
        agent: "Scout",
        confidence: 91,
        conclusion:
          "Complex multi-step flash loan across 3 DEXs. Pattern matches historical exploit probes.",
        tags: ["flash-loan", "exploit-probe", "security"],
        reasoning: [
          {
            step: 1,
            agent: "Scout",
            observation:
              "8-step flash loan involving Uniswap, SushiSwap, Balancer.",
            hypothesis: "Attacker testing price oracle manipulation path.",
            confidence: 90,
          },
          {
            step: 2,
            agent: "Scout",
            observation: "Zero profit extracted.",
            hypothesis:
              "Probe, not exploit. Testing defenses before main attack.",
            confidence: 88,
          },
        ],
      },
      {
        agent: "Analyst",
        confidence: 85,
        conclusion:
          "Likely rehearsal for oracle manipulation attack. Recommend immediate alert to protocol security teams.",
        tags: ["oracle-risk", "rehearsal-attack"],
        reasoning: [
          {
            step: 1,
            agent: "Analyst",
            observation: "No profit, but gas spent was $12K.",
            hypothesis:
              "Attacker willing to burn money to find viable exploit path.",
            confidence: 85,
          },
        ],
      },
      {
        agent: "Risk",
        confidence: 96,
        conclusion:
          "CRITICAL. Multi-protocol flash loan with oracle manipulation pattern is a known exploit vector.",
        tags: ["critical", "oracle-manipulation"],
        reasoning: [
          {
            step: 1,
            agent: "Risk",
            observation: "3 DEXs involved with shared price oracle.",
            hypothesis: "Single oracle point of failure.",
            confidence: 95,
          },
        ],
      },
      {
        agent: "Synthesize",
        confidence: 92,
        conclusion:
          "CRITICAL ALERT: Active exploit rehearsal detected. Protocols at risk. Action: Alert teams immediately.",
        tags: ["critical-alert", "exploit-probe"],
        reasoning: [
          {
            step: 1,
            agent: "Synthesize",
            observation: "Risk Agent: 96% confidence on critical threat.",
            hypothesis: "This overrides all other signals.",
            confidence: 96,
          },
        ],
      },
    ],
    finalScore: 92,
    finalConfidence: 92,
    action: "Act",
    riskLevel: "High",
    timestamp: "2026-05-21T16:00:00Z",
  },
];
