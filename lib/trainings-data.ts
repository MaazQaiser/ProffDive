export type StepType = "reading" | "video" | "quiz" | "exercise";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Step {
  type: StepType;
  duration: string;
  title: string;
  // Reading
  body?: string;
  keyTakeaway?: string;
  pullQuote?: string;
  // Video
  thumbnailUrl?: string;
  videoUrl?: string;
  bulletPoints?: string[];
  // Quiz
  questions?: QuizQuestion[];
  // Exercise
  scenarioPrompt?: string;
  carFields?: { context: string; action: string; result: string };
  modelAnswer?: string;
}

export interface Milestone {
  id: string;
  title: string;
  steps: Step[];
}

export interface Instructor {
  name: string;
  title: string;
  initials: string;
}

export type Pillar = "Thinking" | "Action" | "People" | "Mastery";

export interface Training {
  slug: string;
  title: string;
  description: string;
  pillar: Pillar;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  thumbnailUrl: string;
  unsplashId: string;
  instructor: Instructor;
  enrolled: number;
  completions: number;
  impact: string;
  milestones: Milestone[];
}

export function unsplashUrl(id: string, w = 800): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
}

const PILLAR_COLORS: Record<Pillar, string> = {
  Thinking: "#D97706",
  Action: "#0087A8",
  People: "#16A34A",
  Mastery: "#059669",
};

export { PILLAR_COLORS };

export const TRAININGS: Training[] = [
  {
    slug: "interview-essentials",
    title: "Interview Essentials",
    description: "Master the foundations of high-performance interviewing.",
    pillar: "Action",
    difficulty: "Beginner",
    duration: "12 min",
    thumbnailUrl: "/thumbnails/interview-essentials.jpg",
    unsplashId: "1565728744382-61accd4aa148",
    instructor: { name: "Sarah Chen", title: "Former FAANG Interviewer", initials: "SC" },
    enrolled: 4820,
    completions: 3102,
    impact: "Build a bulletproof first impression in any interview setting.",
    milestones: [
      {
        id: "what-makes-strong",
        title: "What Makes a Strong Answer",
        steps: [
          {
            type: "reading", duration: "2 min", title: "The anatomy of a strong answer",
            body: "Strong interview answers are not about having the perfect story — they're about communicating it with precision. Every strong behavioral answer has three parts: **Context**, **Action**, and **Result**. The context sets the scene without bloating it with irrelevant detail. The action is entirely about what *you* did — not 'we'. The result shows impact, ideally with numbers.",
            keyTakeaway: "Specificity signals credibility. Vague answers lose points every time.",
            pullQuote: "\"The interviewer is not evaluating your past — they're evaluating how you think.\"",
          },
          {
            type: "video", duration: "2 min", title: "Watch: The CAR method in 2 minutes",
            thumbnailUrl: "/thumbnails/interview-essentials.jpg",
            bulletPoints: ["Context should be 1–2 sentences max", "Actions must be first-person and specific", "Results must show measurable change"],
          },
          {
            type: "quiz", duration: "5 min", title: "Quick check: CAR fundamentals",
            questions: [
              { question: "What does the 'R' in CAR stand for?", options: ["Role", "Reasoning", "Result", "Relationship"], correctIndex: 2, explanation: "R = Result. Always quantify the outcome if possible." },
              { question: "In the Action step, you should say:", options: ["'We decided to...'", "'The team felt...'", "'I led and owned...'", "'Management approved...'"], correctIndex: 2, explanation: "Own your actions. Interviewers want to hear what YOU did." },
              { question: "Context should be:", options: ["5+ sentences to set full background", "1–2 sentences of essential background", "A full backstory of the project", "Skipped if the role is obvious"], correctIndex: 1, explanation: "Brief is sharp. Long context buries your action." },
            ],
          },
          {
            type: "exercise", duration: "3 min", title: "Build your first CAR answer",
            scenarioPrompt: "Structure a CAR answer for: 'Tell me about a time you took initiative at work.'",
            carFields: { context: "Briefly describe the situation...", action: "What did YOU specifically do?", result: "What was the measurable outcome?" },
            modelAnswer: "C: Our team's sprint velocity had dropped 30% over 6 weeks with no documented root cause. A: I ran a retrospective analysis, identified that unclear ticket specs were the bottleneck, and proposed a new ticket template. R: Velocity recovered within one sprint and became 15% higher than our previous baseline.",
          },
        ],
      },
      {
        id: "energy-and-presence",
        title: "Energy & Interview Presence",
        steps: [
          { type: "reading", duration: "2 min", title: "How presence changes your score", body: "Research shows that the first 90 seconds of an interview account for disproportionately more of a candidate's overall evaluation. Energy, posture, pace, and tone all signal confidence before words do.", keyTakeaway: "You are being assessed from the moment the call connects.", pullQuote: "\"Confidence is not the absence of nerves — it's the decision to show up anyway.\"" },
          { type: "video", duration: "2 min", title: "Watch: Building interview presence", thumbnailUrl: "/thumbnails/interview-essentials.jpg", bulletPoints: ["Slow down your speech by 20%", "Use pauses strategically before answering", "Mirror professional energy, not casual friendliness"] },
          { type: "quiz", duration: "5 min", title: "Presence fundamentals quiz", questions: [{ question: "The first 90 seconds of an interview are:", options: ["Less important than content", "Mostly ignored by interviewers", "Disproportionately influential", "Only relevant for in-person interviews"], correctIndex: 2, explanation: "First impressions form quickly and influence how remaining answers are received." }, { question: "An effective pause before answering signals:", options: ["Nervousness", "Forgetfulness", "Structured thinking", "Disinterest"], correctIndex: 2, explanation: "Pauses show you think before you speak — a valued trait." }, { question: "You should match the interviewer's energy:", options: ["Exactly, always", "Slightly more professionally", "At casual or friendly levels", "By talking faster"], correctIndex: 1, explanation: "Slightly more professional than the interviewer signals role readiness." }] },
          { type: "exercise", duration: "3 min", title: "Your 30-second opening drill", scenarioPrompt: "Write your response to: 'Tell me a bit about yourself before we start.'", carFields: { context: "One sentence on who you are professionally", action: "One sentence on your most relevant recent work", result: "One sentence on why you're here / what you want next" }, modelAnswer: "I'm a product manager with 4 years at Series A and B startups, most recently owning the growth loop for a B2B SaaS tool that scaled from 200 to 2,000 paying customers. I'm here because I want to move into a larger scope role where I can define product strategy, not just execute it." },
        ],
      },
    ],
  },
  {
    slug: "behavioral-car-method",
    title: "Behavioral CAR Method",
    description: "Go deep on CAR — the framework behind every great behavioral answer.",
    pillar: "Action",
    difficulty: "Intermediate",
    duration: "18 min",
    thumbnailUrl: "/thumbnails/behavioral-car.jpg",
    unsplashId: "1531482615713-2afd69097998",
    instructor: { name: "James Okafor", title: "Ex-McKinsey | Interview Coach", initials: "JO" },
    enrolled: 6340,
    completions: 4201,
    impact: "Drive clarity and conviction into every CAR story you tell.",
    milestones: [
      { id: "car-deep-dive", title: "CAR Deep Dive", steps: [{ type: "reading", duration: "2 min", title: "Beyond the basics of CAR", body: "Most candidates know what CAR is. Few execute it well. The common failure is a bloated Context, a shallow Action, and a generic Result. The elite version: a razor-sharp context (1 line), an action that emphasises judgment and ownership (not just activity), and a result that shows scale and personal contribution.", keyTakeaway: "CAR isn't a formula — it's a clarity discipline.", pullQuote: "\"The gap between a 3/5 and a 5/5 answer is usually in the Action layer.\"" }, { type: "video", duration: "2 min", title: "Side-by-side: weak vs strong CAR", thumbnailUrl: "/thumbnails/behavioral-car.jpg", bulletPoints: ["A weak CAR buries the action in passive voice", "A strong CAR starts with 'I' and shows judgment", "Quantified Results are 3× more memorable"] }, { type: "quiz", duration: "5 min", title: "Diagnosing CAR answers", questions: [{ question: "Which CAR Result is strongest?", options: ["'Things improved after our change.'", "'The team was happier.'", "'NPS went from 41 to 67 in 8 weeks.'", "'Feedback was mostly positive.'"], correctIndex: 2, explanation: "Quantified results with a timeframe are the gold standard." }, { question: "'We redesigned the app together' is a weak Action because:", options: ["It includes design work", "It uses 'we' instead of 'I'", "It's too short", "It mentions an app"], correctIndex: 1, explanation: "Own your contribution. Use I, not we." }, { question: "Context should be:", options: ["Comprehensive project history", "The full meeting agenda", "1–2 sentences of what was at stake", "A list of team members involved"], correctIndex: 2, explanation: "Context frames the situation — not the full backstory." }] }, { type: "exercise", duration: "3 min", title: "Upgrade a weak answer", scenarioPrompt: "Rewrite this weak answer using strong CAR: 'We had a project where things went wrong, and I helped fix it and things got better eventually.'", carFields: { context: "What was the specific situation and what was at stake?", action: "What did YOU specifically decide and do?", result: "What was the measurable improvement and when?" }, modelAnswer: "C: A critical integration broke our checkout flow 3 days before launch, putting £2M in projected revenue at risk. A: I immediately pulled in the API team, diagnosed the root cause within 2 hours, and coordinated a hotfix deployment. R: Checkout was restored 18 hours early and we hit 97% of launch-day revenue targets." }] },
      { id: "story-bank", title: "Building Your Story Bank", steps: [{ type: "reading", duration: "2 min", title: "Why story banks beat prep fatigue", body: "Instead of preparing one answer per question, high performers build a bank of 6–8 versatile stories that can be adapted to dozens of different questions. A story about 'leading through ambiguity' can also answer questions about communication, decision-making, and resilience.", keyTakeaway: "6 great stories beat 30 mediocre ones every time.", pullQuote: "\"The most prepared candidate has a story that works for any question.\"" }, { type: "video", duration: "2 min", title: "How to map your stories to pillars", thumbnailUrl: "/thumbnails/behavioral-car.jpg", bulletPoints: ["Identify 2 stories per competency pillar", "Each story should flex to 3–4 question types", "Practise out loud — memory is different from writing"] }, { type: "quiz", duration: "5 min", title: "Story bank strategy quiz", questions: [{ question: "How many core stories should you aim to have?", options: ["1–2 perfect stories", "6–8 versatile stories", "20+ specific stories", "As many as possible"], correctIndex: 1, explanation: "6–8 well-crafted, versatile stories cover most competency questions." }, { question: "A story about leading through ambiguity can also answer:", options: ["Only ambiguity questions", "Technical depth questions", "Communication and resilience questions too", "Questions about your education"], correctIndex: 2, explanation: "Strong stories are flexible — they demonstrate multiple competencies." }, { question: "Practising out loud is important because:", options: ["It's not that important", "Writing and speaking use different memory", "You should memorise scripts", "It tires you out before interviews"], correctIndex: 1, explanation: "Verbal memory is different from written memory — always rehearse by speaking." }] }, { type: "exercise", duration: "3 min", title: "Map your first story to 3 questions", scenarioPrompt: "Choose one work story. Write it in CAR format, then list 3 different interview questions it could answer.", carFields: { context: "The situation and what was at stake", action: "What you specifically did", result: "The measurable outcome" }, modelAnswer: "Story: Led cross-team coordination to launch a feature 2 weeks early.\nWorks for:\n1. 'Tell me about a time you showed leadership'\n2. 'Describe a time you worked cross-functionally'\n3. 'When did you have to push back on a deadline?'" }] },
    ],
  },
  {
    slug: "tell-me-about-yourself",
    title: "Tell Me About Yourself",
    description: "Craft a compelling, memorable opening that sets the tone.",
    pillar: "People",
    difficulty: "Beginner",
    duration: "15 min",
    thumbnailUrl: "/thumbnails/tell-me-about-yourself.jpg",
    unsplashId: "1560472355-536de3962603",
    instructor: { name: "Priya Nair", title: "Senior Talent Partner | Google", initials: "PN" },
    enrolled: 8910,
    completions: 6780,
    impact: "Craft a signature opening that lands with confidence every time.",
    milestones: [
      { id: "opening-arc", title: "Your Opening Arc", steps: [{ type: "reading", duration: "2 min", title: "Why most openings fail", body: "Most candidates answer 'Tell me about yourself' by reciting their CV in chronological order. This is the least interesting thing you can do. A strong opening is a narrative — it has a trajectory, a turning point, and a clear destination. It answers: who are you, what have you built, and why are you here?", keyTakeaway: "Your opening is a pitch, not a biography.", pullQuote: "\"Don't summarise your LinkedIn — tell me why you're the right person for what's next.\"" }, { type: "video", duration: "2 min", title: "The 3-part opening arc", thumbnailUrl: "/thumbnails/tell-me-about-yourself.jpg", bulletPoints: ["Part 1: Who you are now (one sentence)", "Part 2: What you've built or owned (one strong example)", "Part 3: Why you're here (forward-looking, specific)"] }, { type: "quiz", duration: "5 min", title: "Opening arc quiz", questions: [{ question: "A strong 'Tell me about yourself' should be:", options: ["A full CV walkthrough", "A 10+ minute life story", "A punchy 90-second narrative arc", "A list of technical skills"], correctIndex: 2, explanation: "90 seconds is the sweet spot — enough depth, not enough to lose the room." }, { question: "Part 3 of the arc ('Why you're here') should be:", options: ["Vague and open-ended", "About salary expectations", "Specific to this role and company", "About your personal goals only"], correctIndex: 2, explanation: "Always tie the ending back to the specific opportunity you're interviewing for." }, { question: "'I graduated in 2018 and then...' is a weak opening because:", options: ["It starts with a date", "It's chronological, not narrative", "It mentions graduation", "It's too short"], correctIndex: 1, explanation: "Start with who you are now and what you own — not where you started." }] }, { type: "exercise", duration: "3 min", title: "Write your 90-second opening", scenarioPrompt: "Write your answer to 'Tell me about yourself' using the 3-part arc.", carFields: { context: "Who you are now (one sentence)", action: "Your strongest recent ownership / achievement", result: "Why you're here and what you want next" }, modelAnswer: "I'm a product manager with 5 years of experience building growth products for B2B SaaS companies. Most recently, I owned the onboarding flow at a 300-person startup, reducing time-to-value from 14 days to 3 and increasing 30-day retention by 22%. I'm here because I want to work on a product with more data infrastructure — and your ML personalisation roadmap is exactly the kind of problem I want to own." }] },
    ],
  },
  {
    slug: "success-drivers-deep-dive",
    title: "Success Drivers Deep Dive",
    description: "Understand and master all four competency pillars together.",
    pillar: "Mastery",
    difficulty: "Advanced",
    duration: "22 min",
    thumbnailUrl: "/thumbnails/success-drivers.jpg",
    unsplashId: "1552664730-d307ca884978",
    instructor: { name: "Daniel Lee", title: "L7 PM | Former BCG Associate", initials: "DL" },
    enrolled: 3200,
    completions: 1890,
    impact: "Master all four competency pillars to become a holistic, interview-ready candidate.",
    milestones: [
      { id: "four-pillars", title: "The Four Pillars", steps: [{ type: "reading", duration: "2 min", title: "Why FAANG uses competency frameworks", body: "Top companies don't evaluate candidates on gut feel — they use structured competency frameworks. The four pillars (Thinking, Action, People, Mastery) map to the fundamental traits of high-performing employees: the ability to reason clearly, drive results, collaborate, and go deep.", keyTakeaway: "Every question you're asked maps to one of the four pillars.", pullQuote: "\"Most candidates are strong in 1–2 pillars. The best candidates are balanced across all four.\"" }, { type: "video", duration: "2 min", title: "Mapping your answers to pillars", thumbnailUrl: "/thumbnails/success-drivers.jpg", bulletPoints: ["Power of Thinking: Analytical Thinking, Prioritization, Decision-Making Agility", "Power of Action: Ownership, Initiative & Follow-through, Embraces Change", "Power of People: Influence, Collaboration & Inclusion, Grows Capability", "Power of Mastery: Functional Knowledge, Execution, Innovation"] }, { type: "quiz", duration: "5 min", title: "Pillar mapping quiz", questions: [{ question: "'Describe a time you influenced without authority' maps to:", options: ["Thinking", "Action", "People", "Mastery"], correctIndex: 2, explanation: "Influencing without authority is a People pillar competency about communication and relationship-building." }, { question: "'Walk me through how you'd prioritise 5 features with a limited team' maps to:", options: ["Thinking", "Action", "People", "Mastery"], correctIndex: 0, explanation: "Prioritisation questions test structured thinking — the Thinking pillar." }, { question: "A weak Mastery score most commonly indicates:", options: ["Poor communication", "Lack of initiative", "Insufficient domain depth or technical specificity", "Not enough stories"], correctIndex: 2, explanation: "Mastery is about going deep — generic or surface-level answers score low." }] }, { type: "exercise", duration: "3 min", title: "Rate your pillar strength", scenarioPrompt: "Score yourself 1–5 on each pillar based on your current story bank and interview experience. Then identify the ONE pillar to focus on first.", carFields: { context: "Your Thinking score (1–5) and why", action: "Your Action and People scores with one-line reasoning each", result: "Your Mastery score and your single biggest gap to close" }, modelAnswer: "Thinking: 4 — I structure answers well but can go deeper on trade-off reasoning. Action: 3 — I underuse first-person language and tend to say 'we'. People: 4 — Strong on collaboration stories but weak on influencing-up examples. Mastery: 2 — My domain knowledge is broad but I rarely demonstrate technical depth. FOCUS: Mastery — specifically building 2 deep-domain stories." }] },
    ],
  },
  {
    slug: "handling-ambiguity",
    title: "Handling Ambiguity",
    description: "Show calm, structured thinking when the problem isn't clear.",
    pillar: "Thinking",
    difficulty: "Intermediate",
    duration: "15 min",
    thumbnailUrl: "/thumbnails/handling-ambiguity.jpg",
    unsplashId: "1454165804606-c3d57bc86b40",
    instructor: { name: "Aisha Mensah", title: "Strategy Lead | Bain Alumni", initials: "AM" },
    enrolled: 2750,
    completions: 1640,
    impact: "Show structured thinking under uncertainty to stand out in consulting-style interviews.",
    milestones: [
      { id: "ambiguity-framework", title: "The Ambiguity Framework", steps: [{ type: "reading", duration: "2 min", title: "Why ambiguity is actually a gift", body: "Ambiguous questions aren't traps — they're opportunities. When an interviewer asks 'How would you approach X with no clear information?' they're testing your thinking process, not your final answer. The candidates who score highest are those who acknowledge the ambiguity, clarify before acting, and structure their thinking out loud.", keyTakeaway: "Ask one clarifying question before every ambiguous problem.", pullQuote: "\"The best consultants aren't the ones who have all the answers — they're the ones who ask the right questions first.\"" }, { type: "video", duration: "2 min", title: "Live demo: handling an ambiguous PM question", thumbnailUrl: "/thumbnails/handling-ambiguity.jpg", bulletPoints: ["Pause and repeat the question in your own words", "Ask one clarifying question", "State your assumptions before solving"] }, { type: "quiz", duration: "5 min", title: "Ambiguity quiz", questions: [{ question: "When faced with an ambiguous question, you should first:", options: ["Give an immediate answer", "Clarify one assumption or ask one question", "Say you don't have enough information", "Provide multiple answers"], correctIndex: 1, explanation: "One clarifying question shows structure and prevents wasted effort." }, { question: "Stating your assumptions out loud is valuable because:", options: ["It fills time", "It shows you're thinking and lets the interviewer course-correct", "It makes you look uncertain", "It's not actually valuable"], correctIndex: 1, explanation: "Visible reasoning is the whole point — interviewers want to see your mind work." }, { question: "'I'd need more data before I could answer that' is:", options: ["A strong signal of thoroughness", "A weak deflection that loses marks", "Always acceptable", "Specific to technical roles"], correctIndex: 1, explanation: "Asking for data is fine — refusing to engage is not. Always take a crack at it." }] }, { type: "exercise", duration: "3 min", title: "Structure an ambiguous case", scenarioPrompt: "Structure your approach to: 'Our app engagement dropped 15% last month. What do you do?'", carFields: { context: "What clarifying question would you ask first?", action: "What are your top 3 hypotheses for the drop?", result: "What data would you look at first to test each hypothesis?" }, modelAnswer: "Clarifying question: 'Is the 15% drop in DAU, session length, feature usage, or all of the above?' Hypotheses: 1) External event (competitor launch, seasonal pattern), 2) Product regression (recent release broke a core flow), 3) Acquisition quality shift (new user cohort with different intent). Data: 1) Cohort breakdown by acquisition channel, 2) Release timeline vs engagement drop correlation, 3) Feature-level event data for the affected period." }] },
    ],
  },
  {
    slug: "role-specific-prep-pm",
    title: "Role-Specific Prep: PM",
    description: "Tailored preparation for Product Manager interview formats.",
    pillar: "Mastery",
    difficulty: "Advanced",
    duration: "25 min",
    thumbnailUrl: "/thumbnails/role-specific-pm.jpg",
    unsplashId: "1551288049-bebda4e38f71",
    instructor: { name: "Liam Torres", title: "Group PM | Ex-Google, Ex-Meta", initials: "LT" },
    enrolled: 5500,
    completions: 3120,
    impact: "Perform with genuine depth on PM-specific product design and strategy questions.",
    milestones: [
      { id: "pm-question-types", title: "PM Question Types Decoded", steps: [{ type: "reading", duration: "2 min", title: "The 5 PM interview question types", body: "PM interviews test five distinct skills: **Product Design** (how you'd build something), **Analytical** (how you use data), **Estimation** (how you size problems), **Behavioural** (how you've worked), and **Strategy** (how you think about markets). Each has a different framework and scoring lens.", keyTakeaway: "Identify the question type in the first sentence and switch frameworks accordingly.", pullQuote: "\"The PM who answers a Strategy question with a Design framework will always miss the mark.\"" }, { type: "video", duration: "2 min", title: "Watch: Rapid-fire PM question diagnosis", thumbnailUrl: "/thumbnails/role-specific-pm.jpg", bulletPoints: ["Design questions: user → pain → solution → tradeoffs", "Analytical questions: metric definition → hypothesis → data sources", "Estimation: break the market into components, calculate each"] }, { type: "quiz", duration: "5 min", title: "Question type quiz", questions: [{ question: "'How would you improve Instagram Stories?' is a:", options: ["Analytical question", "Product Design question", "Estimation question", "Strategy question"], correctIndex: 1, explanation: "Improvement questions are Product Design questions — start with users and pain points." }, { question: "'How many Uber rides happen in London per day?' is a:", options: ["Strategy question", "Behavioural question", "Estimation question", "Design question"], correctIndex: 2, explanation: "Market sizing and 'how many' questions are Estimation questions — break them into components." }, { question: "An Analytical question asks you to:", options: ["Design a new product", "Tell a story from your past", "Define a metric, diagnose it, and hypothesise causes", "Evaluate a market opportunity"], correctIndex: 2, explanation: "Analytical questions centre on metrics — pick the right north star first." }] }, { type: "exercise", duration: "3 min", title: "Diagnose and frame 3 questions", scenarioPrompt: "For each question, name the type and state which framework to use:\n1. 'How would you monetise WhatsApp?'\n2. 'Our retention dropped 10%. What would you do?'\n3. 'Design a product for elderly users to manage medications.'", carFields: { context: "Question 1 type and framework", action: "Question 2 type and framework", result: "Question 3 type and framework" }, modelAnswer: "1. Strategy question → Market sizing + monetisation framework (freemium, ads, B2B)\n2. Analytical question → Metric decomposition + cohort analysis + hypothesis testing\n3. Product Design question → User empathy → pain points → solution → tradeoffs → success metrics" }] },
    ],
  },
  {
    slug: "stakeholder-communication",
    title: "Stakeholder Communication",
    description: "Demonstrate influence and clear communication across functions.",
    pillar: "People",
    difficulty: "Intermediate",
    duration: "14 min",
    thumbnailUrl: "/thumbnails/stakeholder-communication.jpg",
    unsplashId: "1573497019940-1c28c88b4f3e",
    instructor: { name: "Yuki Tanaka", title: "Head of Product | Ex-Amazon", initials: "YT" },
    enrolled: 3800,
    completions: 2410,
    impact: "Demonstrate cross-functional influence and communication that scales.",
    milestones: [
      { id: "communication-frameworks", title: "Communication Frameworks", steps: [{ type: "reading", duration: "2 min", title: "Why communication is a hard skill", body: "Communication is the highest-leverage skill in product and strategy roles. Yet most candidates treat it as soft — anecdotal, unmeasured. Strong candidates demonstrate communication through specific stories: how they adapted a message to a C-suite audience, how they resolved a technical-business translation problem, how they got alignment without authority.", keyTakeaway: "Communication stories should show adaptation, not just delivery.", pullQuote: "\"The best communicators don't just speak clearly — they read their audience and adapt in real time.\"" }, { type: "video", duration: "2 min", title: "The audience-first communication model", thumbnailUrl: "/thumbnails/stakeholder-communication.jpg", bulletPoints: ["Know what your audience cares about before you speak", "Lead with the decision or insight — not the backstory", "Adapt your medium: async vs sync, data vs narrative"] }, { type: "quiz", duration: "5 min", title: "Communication quiz", questions: [{ question: "When presenting a technical decision to a C-suite audience, you should lead with:", options: ["Technical specs", "Code architecture", "Business impact and trade-offs", "Team capacity"], correctIndex: 2, explanation: "C-suite audiences care about business outcomes — lead with that, then support with detail." }, { question: "'Getting alignment without authority' is a:", options: ["Action pillar story", "People pillar story", "Mastery pillar story", "Thinking pillar story"], correctIndex: 1, explanation: "Influencing peers and stakeholders without formal authority is a People competency." }, { question: "Adapting your communication style means:", options: ["Always using slides", "Changing your message based on who is listening", "Keeping the same message everywhere", "Using simpler language always"], correctIndex: 1, explanation: "Great communicators adapt based on audience, context, and desired outcome." }] }, { type: "exercise", duration: "3 min", title: "Tell a communication story", scenarioPrompt: "Write a CAR answer for: 'Tell me about a time you had to communicate a complex decision to a non-technical audience.'", carFields: { context: "What was the decision and who was the audience?", action: "How did you adapt your communication approach?", result: "What was the outcome of the communication?" }, modelAnswer: "C: We needed sign-off on a 6-month API migration that required pausing 3 customer features — from a CEO with no engineering background. A: I built a one-page brief that framed the migration as business risk reduction rather than a technical project, using a traffic light system for current risk levels vs post-migration risk. R: The CEO approved in the same meeting, and the framing became the template our team used for all technical roadmap conversations going forward." }] },
    ],
  },
  {
    slug: "data-driven-decisions",
    title: "Data-Driven Decisions",
    description: "Frame every decision with clarity, rigour, and quantitative evidence.",
    pillar: "Thinking",
    difficulty: "Advanced",
    duration: "20 min",
    thumbnailUrl: "/thumbnails/data-driven.jpg",
    unsplashId: "1551288049-bebda4e38f71",
    instructor: { name: "Fatima Al-Hassan", title: "Data PM | Ex-Netflix, Ex-Google", initials: "FA" },
    enrolled: 2100,
    completions: 1230,
    impact: "Frame every product decision with the quantitative rigour top companies expect.",
    milestones: [
      { id: "metrics-north-star", title: "Metrics & North Star Thinking", steps: [{ type: "reading", duration: "2 min", title: "How to pick the right metric", body: "The most common PM mistake in interviews is choosing the wrong metric. Revenue is an output — not a north star. Engagement can be gamed. The right north star metric measures genuine user value, leads business outputs, and is hard to trick. For most consumer products, this is some form of engagement quality multiplied by retention.", keyTakeaway: "Always explain WHY this metric, not just what it is.", pullQuote: "\"A candidate who can argue for a metric — and against an obvious one — signals strategic maturity.\"" }, { type: "video", duration: "2 min", title: "North star metric selection framework", thumbnailUrl: "/thumbnails/data-driven.jpg", bulletPoints: ["User value → leading indicators → lagging indicators", "The 'would this metric go up if we gamed it?' test", "Always name 2–3 guard rails alongside your north star"] }, { type: "quiz", duration: "5 min", title: "Metrics quiz", questions: [{ question: "A north star metric should primarily measure:", options: ["Revenue", "User acquisition cost", "Genuine user value delivered", "Feature usage counts"], correctIndex: 2, explanation: "The north star must reflect real value to users — everything else is downstream of that." }, { question: "Guard rail metrics are used to:", options: ["Replace the north star", "Prevent optimising one metric at the expense of others", "Track only financial performance", "Measure engineering velocity"], correctIndex: 1, explanation: "Guard rails stop you from winning on one dimension while silently losing on others." }, { question: "DAU/MAU ratio is a measure of:", options: ["Revenue efficiency", "Engagement quality / stickiness", "Feature adoption speed", "Churn rate"], correctIndex: 1, explanation: "DAU/MAU measures how habitually active users are — a stickiness proxy." }] }, { type: "exercise", duration: "3 min", title: "Define a north star for a product", scenarioPrompt: "Choose a north star metric for: a social reading app where users highlight and discuss books.", carFields: { context: "What user value does the app create?", action: "What is your proposed north star metric and why?", result: "What are 2 guard rail metrics you'd track alongside it?" }, modelAnswer: "User value: creating meaningful discussion around books — learning and connection. North star: 'Weekly active discussants' (users who both highlight AND comment at least once per week) — because this captures depth of engagement, not just passive reading. Guard rails: 1) Book completion rate (don't sacrifice depth for discussion), 2) D7 retention (ensure we're building a habit, not a spike)." }] },
    ],
  },
  {
    slug: "leadership-under-pressure",
    title: "Leadership Under Pressure",
    description: "Show composure, clarity, and ownership during high-stakes moments.",
    pillar: "People",
    difficulty: "Intermediate",
    duration: "17 min",
    thumbnailUrl: "/thumbnails/leadership-pressure.jpg",
    unsplashId: "1519389950473-47ba0277781c",
    instructor: { name: "Marcus Reid", title: "VP Product | Ex-McKinsey", initials: "MR" },
    enrolled: 4150,
    completions: 2740,
    impact: "Demonstrate the composure and ownership that define high-performing leaders.",
    milestones: [
      { id: "pressure-stories", title: "Building Pressure Stories", steps: [{ type: "reading", duration: "2 min", title: "What high-pressure stories reveal", body: "Interviewers ask about high-pressure moments not to find out if you've suffered — but to see how you respond when things go wrong. They're looking for three signals: Did you stay calm? Did you take ownership? Did you improve the situation with intentional action rather than reactive panic?", keyTakeaway: "The best pressure stories show growth, not just survival.", pullQuote: "\"Leadership under pressure isn't about staying calm — it's about thinking clearly when others aren't.\"" }, { type: "video", duration: "2 min", title: "Anatomy of a great pressure story", thumbnailUrl: "/thumbnails/leadership-pressure.jpg", bulletPoints: ["Set the stakes clearly — what would fail if you didn't act?", "Show your decision-making process, not just what you did", "End with what you'd do differently — it signals self-awareness"] }, { type: "quiz", duration: "5 min", title: "Pressure story quiz", questions: [{ question: "The most important element of a high-pressure story is:", options: ["How extreme the situation was", "How you made intentional decisions under pressure", "That it worked out perfectly in the end", "That it involved multiple people"], correctIndex: 1, explanation: "Interviewers assess your decision-making process — not the outcome." }, { question: "Ending a pressure story with 'what I'd do differently' signals:", options: ["Weakness", "Self-awareness and growth mindset", "That you failed", "That you're inexperienced"], correctIndex: 1, explanation: "Reflection shows maturity — it's one of the strongest signals you can give." }, { question: "Taking ownership in a pressure story means:", options: ["Blaming others for the pressure", "Saying you had no control", "Acting as if the result depended entirely on you", "Showing the team fixed it together"], correctIndex: 2, explanation: "Ownership is a first-person assertion of accountability and responsibility." }] }, { type: "exercise", duration: "3 min", title: "Build a high-pressure story", scenarioPrompt: "Write a CAR answer for: 'Tell me about a time you had to make a critical decision with limited information and under time pressure.'", carFields: { context: "What were the stakes and the time constraint?", action: "What decision did you make and how did you reason through it?", result: "What was the outcome and what did you learn?" }, modelAnswer: "C: On the day of our product launch, our payment provider failed at 9am — 2 hours before the launch event. We had 400 registered attendees and a live press mention scheduled. A: I decided to delay the payment feature by 24 hours, launch the product without monetisation, and proactively communicate the change in a way that framed it as a deliberate sequencing decision. I drafted the message, got CTO sign-off in 15 minutes, and sent it before the launch stream. R: Launch NPS was 72. Three journalists covered it without mentioning the payment delay. The 24-hour delay also gave us time to catch a second bug we hadn't seen. I learned that proactive honesty usually performs better than damage control." }] },
    ],
  },
  {
    slug: "structuring-any-answer",
    title: "Structuring Any Answer",
    description: "Answer any interview question with clarity and logical structure.",
    pillar: "Thinking",
    difficulty: "Beginner",
    duration: "13 min",
    thumbnailUrl: "/thumbnails/structuring-answers.jpg",
    unsplashId: "1517971129774-8a2b38fa128e",
    instructor: { name: "Sofia Eriksson", title: "Interview Coach | Ex-BCG", initials: "SE" },
    enrolled: 7200,
    completions: 5610,
    impact: "Answer any question — expected or unexpected — with a clear, logical structure.",
    milestones: [
      { id: "structure-frameworks", title: "Universal Structure Frameworks", steps: [{ type: "reading", duration: "2 min", title: "The 3 structures that work everywhere", body: "Three structures cover 90% of interview questions. **The 3-point rule**: when in doubt, give exactly 3 reasons or components. **The 'because → therefore' chain**: state a claim, give evidence, derive a conclusion. **The pyramid**: start with your answer, then support it — never bury the lead.", keyTakeaway: "Always give your answer first, then support it. Never work up to it.", pullQuote: "\"The biggest structural mistake is saving your conclusion for the end. Interviewers lose interest before you get there.\"" }, { type: "video", duration: "2 min", title: "Live demo: structuring 3 different question types", thumbnailUrl: "/thumbnails/structuring-answers.jpg", bulletPoints: ["Open-ended questions: answer → 3 supports → conclusion", "Hypothetical questions: reframe → structure → explore", "Pushback scenarios: acknowledge → restate → defend with data"] }, { type: "quiz", duration: "5 min", title: "Structure quiz", questions: [{ question: "The 'pyramid principle' means:", options: ["Starting with the most detailed information", "Building up to your conclusion at the end", "Leading with your conclusion, then supporting it", "Organising information in a triangle shape"], correctIndex: 2, explanation: "Lead with the conclusion. Busy interviewers want the answer first, detail second." }, { question: "'I think the main issue is X, because A, B, and C' is an example of:", options: ["The 3-point rule", "The pyramid principle", "The because → therefore chain", "All of the above"], correctIndex: 3, explanation: "This response combines all three — a clear answer first, three supports, logical chain." }, { question: "When an interviewer pushes back on your answer, you should:", options: ["Immediately agree", "Ignore the pushback", "Acknowledge their point, then defend or refine with data", "Change your answer completely"], correctIndex: 2, explanation: "Pushback is often a test. Acknowledging it shows maturity; defending with data shows conviction." }] }, { type: "exercise", duration: "3 min", title: "Structure an answer to a tricky question", scenarioPrompt: "Structure your answer to: 'What's the biggest mistake you've made in your career, and what did you learn?'", carFields: { context: "What was the mistake? (Be specific, own it)", action: "What did you do when you realised it?", result: "What did you concretely change as a result?" }, modelAnswer: "My biggest mistake was shipping a feature without a rollback plan. C: We were under launch pressure and I approved a release of a pricing change feature without a fast-undo mechanism. A: When a critical bug emerged post-launch, we spent 4 hours doing a manual database rollback while 200 users saw incorrect pricing. R: I introduced a mandatory rollback protocol for all pricing and billing changes — it's been used 3 times since and saved significant firefighting time each time. The meta-learning was: pressure is when process matters most, not least." }] },
    ],
  },
  {
    slug: "owning-your-narrative",
    title: "Owning Your Narrative",
    description: "Take control of your story across every question type.",
    pillar: "Action",
    difficulty: "Intermediate",
    duration: "16 min",
    thumbnailUrl: "/thumbnails/owning-narrative.jpg",
    unsplashId: "1475721027785-f74ec9c669f2",
    instructor: { name: "Kofi Adu", title: "Career Strategist | Ex-Meta Recruiter", initials: "KA" },
    enrolled: 3600,
    completions: 2280,
    impact: "Take authorship of your professional story so every answer reinforces the same identity.",
    milestones: [
      { id: "narrative-thread", title: "Your Narrative Thread", steps: [{ type: "reading", duration: "2 min", title: "What it means to own your narrative", body: "The best candidates enter an interview with a clear identity statement: not a job title, but a *theme*. Something like: 'I am someone who builds high-trust teams and then uses that trust to push ambitious decisions through fast.' Every story they tell reinforces this theme. Their answers feel coherent, not random.", keyTakeaway: "Decide your identity statement before the interview — then let every answer reinforce it.", pullQuote: "\"The candidate who owns their story never scrambles for an answer. They filter every question through their theme.\"" }, { type: "video", duration: "2 min", title: "How to craft your identity statement", thumbnailUrl: "/thumbnails/owning-narrative.jpg", bulletPoints: ["Your identity is not your job title — it's your method of impact", "It should be 1–2 sentences, memorable, and specific to your pillar strength", "Test it: does every story you tell support it?"] }, { type: "quiz", duration: "5 min", title: "Narrative ownership quiz", questions: [{ question: "An identity statement is best described as:", options: ["Your job title and years of experience", "A theme about how you create impact", "A summary of your education", "A list of your skills"], correctIndex: 1, explanation: "Identity statements are about impact method, not biography." }, { question: "If your stories feel random and unconnected, it likely means:", options: ["You have too much experience", "You haven't defined your narrative thread", "Your stories are too strong", "The interviewer is asking the wrong questions"], correctIndex: 1, explanation: "A coherent narrative makes stories feel connected — without it, they feel like a collection of incidents." }, { question: "Owning your narrative helps most when:", options: ["Answering technical questions", "Responding to an unexpected question", "Reading from a script", "Answering only easy questions"], correctIndex: 1, explanation: "When unexpected questions hit, a narrative thread means you always have an anchor." }] }, { type: "exercise", duration: "3 min", title: "Write your identity statement", scenarioPrompt: "Complete this: 'I am someone who [impact method] by [how you do it], and I am at my best when [context where you thrive].'", carFields: { context: "Your impact method (what you reliably achieve)", action: "How you do it (your distinct approach or strength)", result: "The context where you're most effective" }, modelAnswer: "I am someone who turns ambiguous problems into clear product strategy by obsessively talking to users and mapping their needs to business levers, and I'm at my best when working in environments where speed and learning matter more than perfection." }] },
    ],
  },
  {
    slug: "technical-depth-for-pms",
    title: "Technical Depth for PMs",
    description: "Demonstrate technical credibility without needing an engineering background.",
    pillar: "Mastery",
    difficulty: "Advanced",
    duration: "28 min",
    thumbnailUrl: "/thumbnails/technical-depth.jpg",
    unsplashId: "1498050108023-c5249f4df085",
    instructor: { name: "Rohan Mehta", title: "Technical PM | Ex-Google, Ex-Apple", initials: "RM" },
    enrolled: 1900,
    completions: 1010,
    impact: "Signal the technical credibility that top-tier engineering teams need to trust you.",
    milestones: [
      { id: "technical-credibility", title: "Building Technical Credibility", steps: [{ type: "reading", duration: "2 min", title: "What technical depth really means for PMs", body: "Technical depth for PMs is not about writing code — it's about demonstrating that you understand trade-offs. When engineers say 'that'll take 6 weeks' you need to know enough to ask: 'Is that because of the API layer, the data model, or testing?' That question alone signals deep partnership — not surface-level PM-ing.", keyTakeaway: "Technical PM depth is about asking the right questions, not having all the answers.", pullQuote: "\"Engineers trust PMs who ask informed questions — not PMs who pretend to code or PMs who are completely helpless.\"" }, { type: "video", duration: "2 min", title: "The technical PM conversation model", thumbnailUrl: "/thumbnails/technical-depth.jpg", bulletPoints: ["Learn the stack well enough to ask about constraints", "Understand API vs data model vs infra trade-offs at a conceptual level", "Ask 'what's the most fragile part of this?' before every spec"] }, { type: "quiz", duration: "5 min", title: "Technical depth quiz", questions: [{ question: "When an engineer says a feature will take 6 weeks, a technically credible PM asks:", options: ["'Can we do it in 3?'", "'Is the constraint in the API layer, data model, or testing?'", "'Why so long?'", "'I'll trust your estimate.'"], correctIndex: 1, explanation: "Drilling into the constraint shows you understand how systems are structured — and earns trust." }, { question: "Technical depth for PMs primarily demonstrates:", options: ["That you can code", "That you understand trade-offs and constraints", "That you don't need engineers", "That you have a CS degree"], correctIndex: 1, explanation: "The goal is informed partnership, not engineering expertise." }, { question: "'API-first design' means:", options: ["Building the UI before the backend", "Designing the interface between systems before implementation details", "Using only third-party APIs", "Avoiding database changes"], correctIndex: 1, explanation: "API-first means the contract between systems is defined first — enabling parallel development and future flexibility." }] }, { type: "exercise", duration: "3 min", title: "Ask a technically credible question", scenarioPrompt: "You're in a sprint planning meeting. Your PM spec requires real-time notifications across web and mobile. An engineer says it'll take 3 weeks.\n\nWrite 2 questions that show technical awareness and help you understand the trade-offs.", carFields: { context: "Question 1: Ask about the architectural constraint", action: "Question 2: Ask about the trade-off or alternative approach", result: "What would you look to de-scope or phase to accelerate?" }, modelAnswer: "Q1: 'Is the complexity mainly in the WebSocket layer for web, or is it the mobile push notification service integration that's the bottleneck?' Q2: 'Is there a polling-based fallback we could ship in week 1 as an interim — so users get notified even if it's 30s delayed — while we finish the real-time layer?' De-scope: Launch with polling + banners for web in week 1, ship real-time in week 3. Users get value immediately while we avoid the rush." }] },
    ],
  },
];

export function getTraining(slug: string): Training | undefined {
  return TRAININGS.find((t) => t.slug === slug);
}

export function getRecommended(count = 3): Training[] {
  return TRAININGS.slice(0, count);
}

export function filterByPillar(pillar: Pillar | "All"): Training[] {
  if (pillar === "All") return TRAININGS;
  return TRAININGS.filter((t) => t.pillar === pillar);
}
