import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const commercialSyllabus = [
  // ECONOMICS - Complete JAMB Syllabus
  {
    subject: 'economics',
    topic: 'Introduction to Economics',
    subtopic: 'Basic Concepts and Scope',
    objectives: [
      'Define economics and explain its scope',
      'Distinguish between microeconomics and macroeconomics',
      'Explain the basic economic problems of society',
      'Identify the factors of production and their rewards',
      'Understand opportunity cost and its applications'
    ],
    recommended_content: `GENERAL AIMS: To understand the basic concepts of economics and apply economic principles to everyday life.

TOPICS:
1. Definition and Scope of Economics
   - Meaning of economics
   - Scope of economics (microeconomics vs macroeconomics)
   - Importance of studying economics

2. Basic Economic Problems
   - What to produce
   - How to produce
   - For whom to produce
   - Scarcity, choice and opportunity cost

3. Factors of Production
   - Land and its characteristics
   - Labour and its efficiency
   - Capital and its types
   - Entrepreneurship and its functions
   - Factor rewards: rent, wages, interest, profit

4. Economic Systems
   - Capitalism (free market economy)
   - Socialism (command economy)
   - Mixed economy
   - Advantages and disadvantages of each system

RECOMMENDED TEXTBOOKS:
- Fundamentals of Economics by R.A.I. Anyanwuocha
- Essential Economics by C.E. Ande
- A-Level Economics by Lipsey & Chrystal
- Comprehensive Economics for Senior Secondary Schools by J.U. Anyaele`,
    difficulty_level: 'beginner',
    estimated_reading_time: 45,
    order_index: 1
  },
  {
    subject: 'economics',
    topic: 'Theory of Demand and Supply',
    subtopic: 'Price Determination',
    objectives: [
      'Explain the law of demand and its exceptions',
      'Understand factors affecting demand',
      'Explain the law of supply',
      'Analyze market equilibrium and price determination',
      'Calculate and interpret elasticity of demand and supply'
    ],
    recommended_content: `TOPICS:
1. Theory of Demand
   - Definition and law of demand
   - Demand schedule and demand curve
   - Types of demand (composite, derived, joint, competitive)
   - Factors affecting demand
   - Exceptions to the law of demand

2. Theory of Supply
   - Definition and law of supply
   - Supply schedule and supply curve
   - Factors affecting supply
   - Exceptions to the law of supply

3. Elasticity of Demand
   - Price elasticity of demand
   - Income elasticity of demand
   - Cross elasticity of demand
   - Factors affecting elasticity
   - Applications of elasticity

4. Elasticity of Supply
   - Concept and measurement
   - Factors affecting elasticity of supply

5. Price Determination
   - Market equilibrium
   - Shifts in demand and supply curves
   - Effects of changes in demand and supply
   - Price controls (maximum and minimum prices)

RECOMMENDED TEXTBOOKS:
- Fundamentals of Economics by R.A.I. Anyanwuocha
- Essential Economics by C.E. Ande`,
    difficulty_level: 'intermediate',
    estimated_reading_time: 60,
    order_index: 2
  },
  {
    subject: 'economics',
    topic: 'Theory of Consumer Behaviour',
    subtopic: 'Utility Analysis',
    objectives: [
      'Explain the concept of utility',
      'Distinguish between total and marginal utility',
      'State the law of diminishing marginal utility',
      'Analyze consumer equilibrium',
      'Understand indifference curve analysis'
    ],
    recommended_content: `TOPICS:
1. Concept of Utility
   - Definition of utility
   - Types: total utility, marginal utility, average utility
   - Measurement of utility (cardinal and ordinal approaches)

2. Law of Diminishing Marginal Utility
   - Statement of the law
   - Assumptions of the law
   - Limitations of the law
   - Practical applications

3. Consumer Equilibrium
   - Conditions for consumer equilibrium
   - Equi-marginal principle
   - Consumer surplus

4. Indifference Curve Analysis
   - Concept of indifference curve
   - Properties of indifference curves
   - Budget line/constraint
   - Consumer equilibrium using indifference curves
   - Effects of changes in income and prices

RECOMMENDED TEXTBOOKS:
- Comprehensive Economics by J.U. Anyaele
- Essential Economics by C.E. Ande`,
    difficulty_level: 'intermediate',
    estimated_reading_time: 50,
    order_index: 3
  },
  {
    subject: 'economics',
    topic: 'Theory of Production',
    subtopic: 'Production and Costs',
    objectives: [
      'Explain the concept of production',
      'Understand the law of variable proportions',
      'Distinguish between short-run and long-run production',
      'Analyze different types of costs',
      'Understand economies and diseconomies of scale'
    ],
    recommended_content: `TOPICS:
1. Concept of Production
   - Definition and types of production
   - Factors of production
   - Production function

2. Law of Variable Proportions (Diminishing Returns)
   - Statement of the law
   - Stages of production
   - Assumptions and limitations

3. Short-Run and Long-Run Production
   - Fixed and variable inputs
   - Total, average and marginal products
   - Returns to scale

4. Theory of Costs
   - Opportunity cost vs money cost
   - Fixed costs and variable costs
   - Total, average and marginal costs
   - Short-run and long-run cost curves

5. Economies and Diseconomies of Scale
   - Internal economies of scale
   - External economies of scale
   - Causes of diseconomies of scale

RECOMMENDED TEXTBOOKS:
- Fundamentals of Economics by R.A.I. Anyanwuocha
- A-Level Economics by Lipsey`,
    difficulty_level: 'intermediate',
    estimated_reading_time: 55,
    order_index: 4
  },
  {
    subject: 'economics',
    topic: 'Market Structures',
    subtopic: 'Perfect and Imperfect Competition',
    objectives: [
      'Explain the features of perfect competition',
      'Analyze monopoly and its characteristics',
      'Understand monopolistic competition',
      'Explain oligopoly and its features',
      'Compare different market structures'
    ],
    recommended_content: `TOPICS:
1. Perfect Competition
   - Features/assumptions
   - Price and output determination
   - Short-run and long-run equilibrium
   - Advantages and disadvantages

2. Monopoly
   - Definition and sources of monopoly power
   - Price and output determination
   - Price discrimination
   - Advantages and disadvantages
   - Control of monopoly

3. Monopolistic Competition
   - Features
   - Product differentiation
   - Price and output determination
   - Comparison with perfect competition

4. Oligopoly
   - Features
   - Types (collusive and non-collusive)
   - Kinked demand curve
   - Price leadership

5. Comparison of Market Structures
   - Efficiency considerations
   - Welfare implications

RECOMMENDED TEXTBOOKS:
- Essential Economics by C.E. Ande
- Comprehensive Economics by J.U. Anyaele`,
    difficulty_level: 'advanced',
    estimated_reading_time: 65,
    order_index: 5
  },
  {
    subject: 'economics',
    topic: 'National Income',
    subtopic: 'Measurement and Concepts',
    objectives: [
      'Define national income and related concepts',
      'Explain methods of measuring national income',
      'Understand the circular flow of income',
      'Identify problems of measuring national income',
      'Explain the uses of national income statistics'
    ],
    recommended_content: `TOPICS:
1. Concepts of National Income
   - Gross Domestic Product (GDP)
   - Gross National Product (GNP)
   - Net National Product (NNP)
   - National Income (NI)
   - Personal Income (PI)
   - Disposable Income (DI)
   - Per capita income

2. Methods of Measuring National Income
   - Income approach
   - Output/Product approach
   - Expenditure approach

3. Circular Flow of Income
   - Two-sector model
   - Three-sector model
   - Four-sector model
   - Injections and withdrawals

4. Problems of Measuring National Income
   - Double counting
   - Non-monetized transactions
   - Statistical difficulties
   - Illegal activities

5. Uses and Limitations of National Income Statistics

RECOMMENDED TEXTBOOKS:
- Fundamentals of Economics by R.A.I. Anyanwuocha
- Essential Economics by C.E. Ande`,
    difficulty_level: 'intermediate',
    estimated_reading_time: 50,
    order_index: 6
  },
  {
    subject: 'economics',
    topic: 'Money and Banking',
    subtopic: 'Financial System',
    objectives: [
      'Explain the functions and characteristics of money',
      'Understand the evolution of money',
      'Explain the functions of commercial and central banks',
      'Understand monetary policy instruments',
      'Analyze inflation and its effects'
    ],
    recommended_content: `TOPICS:
1. Money
   - Definition and evolution
   - Functions of money
   - Characteristics/qualities of good money
   - Types of money

2. Commercial Banks
   - Functions of commercial banks
   - Credit creation process
   - Limitations on credit creation

3. Central Bank
   - Functions of central bank
   - Central Bank of Nigeria (CBN)
   - Monetary policy instruments
   - Quantitative and qualitative controls

4. Other Financial Institutions
   - Mortgage banks
   - Development banks
   - Insurance companies
   - Stock exchange

5. Inflation
   - Types of inflation
   - Causes of inflation
   - Effects of inflation
   - Control measures

RECOMMENDED TEXTBOOKS:
- Comprehensive Economics by J.U. Anyaele
- Essential Economics by C.E. Ande`,
    difficulty_level: 'intermediate',
    estimated_reading_time: 55,
    order_index: 7
  },
  {
    subject: 'economics',
    topic: 'Public Finance',
    subtopic: 'Government Revenue and Expenditure',
    objectives: [
      'Explain sources of government revenue',
      'Understand the principles and types of taxation',
      'Analyze government expenditure',
      'Explain the concept of budget',
      'Understand public debt management'
    ],
    recommended_content: `TOPICS:
1. Sources of Government Revenue
   - Tax revenue
   - Non-tax revenue
   - Grants and aids

2. Taxation
   - Principles/canons of taxation
   - Types of taxes (direct and indirect)
   - Effects of taxation
   - Tax incidence and shifting

3. Government Expenditure
   - Types of government expenditure
   - Recurrent vs capital expenditure
   - Effects of government expenditure

4. Government Budget
   - Types of budget
   - Balanced, surplus and deficit budgets
   - Fiscal policy

5. Public Debt
   - Internal and external debt
   - Reasons for borrowing
   - Debt management
   - National debt burden

RECOMMENDED TEXTBOOKS:
- Fundamentals of Economics by R.A.I. Anyanwuocha
- Essential Economics by C.E. Ande`,
    difficulty_level: 'intermediate',
    estimated_reading_time: 50,
    order_index: 8
  },
  {
    subject: 'economics',
    topic: 'International Trade',
    subtopic: 'Trade and Finance',
    objectives: [
      'Explain the basis for international trade',
      'Understand balance of payments',
      'Analyze exchange rate systems',
      'Explain trade policies',
      'Understand international economic organizations'
    ],
    recommended_content: `TOPICS:
1. Basis for International Trade
   - Absolute advantage theory
   - Comparative advantage theory
   - Terms of trade
   - Gains from trade

2. Balance of Payments
   - Components (current and capital accounts)
   - Balance of payments disequilibrium
   - Causes and correction measures

3. Exchange Rate
   - Fixed exchange rate
   - Floating exchange rate
   - Managed float
   - Factors affecting exchange rates
   - Devaluation and revaluation

4. Trade Policies
   - Free trade and protection
   - Arguments for protection
   - Tariffs, quotas and embargoes
   - Economic integration

5. International Economic Organizations
   - IMF, World Bank, WTO
   - ECOWAS, AU
   - OPEC

RECOMMENDED TEXTBOOKS:
- Comprehensive Economics by J.U. Anyaele
- International Economics by Dominick Salvatore`,
    difficulty_level: 'advanced',
    estimated_reading_time: 60,
    order_index: 9
  },
  {
    subject: 'economics',
    topic: 'Economic Development',
    subtopic: 'Growth and Development',
    objectives: [
      'Distinguish between economic growth and development',
      'Understand indicators of development',
      'Analyze problems of developing countries',
      'Explain development planning in Nigeria',
      'Understand population and development'
    ],
    recommended_content: `TOPICS:
1. Economic Growth vs Development
   - Definitions and differences
   - Indicators of development
   - Human Development Index (HDI)

2. Characteristics of Developing Countries
   - Low per capita income
   - High population growth
   - Dualistic economy
   - Dependence on primary products

3. Problems of Development
   - Capital formation
   - Technological backwardness
   - Human resource constraints
   - Infrastructural deficiencies

4. Development Planning in Nigeria
   - History of development plans
   - Rolling plans
   - National Economic Empowerment and Development Strategy (NEEDS)
   - Vision 20:2020

5. Population and Development
   - Population theories (Malthusian)
   - Population and economic development
   - Population policy in Nigeria

RECOMMENDED TEXTBOOKS:
- Fundamentals of Economics by R.A.I. Anyanwuocha
- Development Economics by Michael Todaro`,
    difficulty_level: 'advanced',
    estimated_reading_time: 55,
    order_index: 10
  },

  // COMMERCE - Complete JAMB Syllabus
  {
    subject: 'commerce',
    topic: 'Introduction to Commerce',
    subtopic: 'Basic Concepts',
    objectives: [
      'Define commerce and explain its scope',
      'Distinguish between trade and commerce',
      'Explain the importance of commerce',
      'Identify the components of commerce',
      'Understand the relationship between commerce and production'
    ],
    recommended_content: `GENERAL AIMS: To understand the fundamentals of commercial activities and their role in economic development.

TOPICS:
1. Definition and Scope of Commerce
   - Meaning of commerce
   - Components: trade and aids to trade
   - Relationship with production and consumption

2. Trade
   - Definition and types
   - Home trade (wholesale and retail)
   - Foreign trade (import, export, entrepot)

3. Aids to Trade
   - Banking and finance
   - Insurance
   - Transportation
   - Warehousing
   - Communication
   - Advertising

4. Importance of Commerce
   - Creation of utility (time, place, possession)
   - Employment generation
   - Standard of living improvement
   - Industrial development

RECOMMENDED TEXTBOOKS:
- Essential Commerce for Senior Secondary Schools by O.A. Longe
- Comprehensive Commerce by J.O. Odedokun
- Commerce for Senior Secondary Schools by Ojo Ade`,
    difficulty_level: 'beginner',
    estimated_reading_time: 40,
    order_index: 1
  },
  {
    subject: 'commerce',
    topic: 'Trade',
    subtopic: 'Home and Foreign Trade',
    objectives: [
      'Explain the different types of trade',
      'Distinguish between wholesale and retail trade',
      'Understand the functions of wholesalers and retailers',
      'Analyze foreign trade and its benefits',
      'Explain barriers to international trade'
    ],
    recommended_content: `TOPICS:
1. Home Trade
   - Wholesale trade
   - Functions of wholesalers
   - Types of wholesalers
   - Retail trade
   - Functions of retailers
   - Types of retail outlets

2. Types of Retailers
   - Small-scale retailers (hawkers, kiosk, market stalls)
   - Large-scale retailers (departmental stores, supermarkets, chain stores)
   - Mobile shops, vending machines

3. Foreign Trade
   - Import trade
   - Export trade
   - Entrepot trade
   - Visible and invisible trade
   - Balance of trade

4. Documents in Foreign Trade
   - Bill of lading
   - Certificate of origin
   - Consular invoice
   - Letter of credit

5. Barriers to International Trade
   - Tariffs and quotas
   - Exchange control
   - Embargo
   - Administrative barriers

RECOMMENDED TEXTBOOKS:
- Essential Commerce by O.A. Longe
- Comprehensive Commerce by J.O. Odedokun`,
    difficulty_level: 'intermediate',
    estimated_reading_time: 55,
    order_index: 2
  },
  {
    subject: 'commerce',
    topic: 'Business Units',
    subtopic: 'Forms of Business Organizations',
    objectives: [
      'Explain different forms of business organizations',
      'Compare sole proprietorship and partnership',
      'Understand the formation of companies',
      'Analyze cooperative societies',
      'Explain public enterprises and privatization'
    ],
    recommended_content: `TOPICS:
1. Sole Proprietorship
   - Features, advantages and disadvantages
   - Formation and dissolution

2. Partnership
   - Types of partners and partnerships
   - Partnership deed
   - Advantages and disadvantages
   - Dissolution of partnership

3. Companies
   - Private limited company
   - Public limited company
   - Formation procedures
   - Memorandum and Articles of Association
   - Prospectus and share capital

4. Cooperative Societies
   - Types of cooperatives
   - Principles of cooperation
   - Advantages and disadvantages
   - Registration and management

5. Public Enterprises
   - Types (public corporations, government companies)
   - Reasons for establishment
   - Privatization and commercialization

RECOMMENDED TEXTBOOKS:
- Comprehensive Commerce by J.O. Odedokun
- Business Studies by O.A. Lawal`,
    difficulty_level: 'intermediate',
    estimated_reading_time: 60,
    order_index: 3
  },
  {
    subject: 'commerce',
    topic: 'Finance',
    subtopic: 'Business Finance and Banking',
    objectives: [
      'Explain sources of business finance',
      'Understand the functions of commercial banks',
      'Analyze the role of central bank',
      'Explain other financial institutions',
      'Understand the stock exchange'
    ],
    recommended_content: `TOPICS:
1. Sources of Business Finance
   - Internal sources (retained profits, depreciation)
   - External sources (shares, debentures, loans)
   - Short-term vs long-term finance

2. Commercial Banks
   - Functions of commercial banks
   - Types of accounts
   - Services rendered by banks
   - Electronic banking

3. Central Bank
   - Functions of CBN
   - Monetary policy
   - Banker to government and banks
   - Currency management

4. Other Financial Institutions
   - Merchant banks
   - Development banks
   - Microfinance banks
   - Insurance companies
   - Pension funds

5. Stock Exchange
   - Functions of stock exchange
   - Nigerian Stock Exchange
   - Securities traded
   - Benefits of stock exchange listing

RECOMMENDED TEXTBOOKS:
- Essential Commerce by O.A. Longe
- Comprehensive Commerce by J.O. Odedokun`,
    difficulty_level: 'intermediate',
    estimated_reading_time: 55,
    order_index: 4
  },
  {
    subject: 'commerce',
    topic: 'Insurance',
    subtopic: 'Principles and Types',
    objectives: [
      'Explain the concept and importance of insurance',
      'Understand the principles of insurance',
      'Analyze different types of insurance',
      'Explain insurance documents and claims',
      'Understand reinsurance'
    ],
    recommended_content: `TOPICS:
1. Concept of Insurance
   - Definition and importance
   - Risks: insurable and non-insurable
   - Functions of insurance

2. Principles of Insurance
   - Utmost good faith
   - Insurable interest
   - Indemnity
   - Subrogation
   - Contribution
   - Proximate cause

3. Types of Insurance
   - Life assurance (whole life, endowment, term)
   - Fire insurance
   - Marine insurance
   - Motor vehicle insurance
   - Burglary insurance
   - Fidelity guarantee

4. Insurance Documents
   - Proposal form
   - Cover note
   - Insurance policy
   - Premium receipt

5. Claims and Reinsurance
   - Procedure for making claims
   - Settlement of claims
   - Reinsurance and co-insurance

RECOMMENDED TEXTBOOKS:
- Comprehensive Commerce by J.O. Odedokun
- Insurance Principles and Practice by Irukwu`,
    difficulty_level: 'intermediate',
    estimated_reading_time: 50,
    order_index: 5
  },
  {
    subject: 'commerce',
    topic: 'Transportation',
    subtopic: 'Modes and Documentation',
    objectives: [
      'Explain the importance of transportation in commerce',
      'Analyze different modes of transport',
      'Understand transport documentation',
      'Evaluate advantages and disadvantages of each mode',
      'Explain factors influencing choice of transport'
    ],
    recommended_content: `TOPICS:
1. Importance of Transportation
   - Movement of goods and people
   - Creation of place and time utility
   - Market expansion
   - Economic development

2. Modes of Transport
   - Road transport
   - Rail transport
   - Water transport (inland and sea)
   - Air transport
   - Pipeline transport

3. Transport Documentation
   - Waybill
   - Consignment note
   - Bill of lading
   - Airway bill
   - Charter party

4. Advantages and Disadvantages
   - Comparison of different modes
   - Cost considerations
   - Speed and reliability
   - Safety and security

5. Factors Influencing Choice
   - Nature of goods
   - Cost and speed
   - Distance and destination
   - Availability and reliability

RECOMMENDED TEXTBOOKS:
- Essential Commerce by O.A. Longe
- Comprehensive Commerce by J.O. Odedokun`,
    difficulty_level: 'beginner',
    estimated_reading_time: 45,
    order_index: 6
  },
  {
    subject: 'commerce',
    topic: 'Communication',
    subtopic: 'Business Communication',
    objectives: [
      'Explain the importance of communication in business',
      'Identify different means of communication',
      'Understand postal services',
      'Analyze telecommunications services',
      'Explain electronic communication methods'
    ],
    recommended_content: `TOPICS:
1. Importance of Communication
   - Coordination of activities
   - Decision making
   - Customer relations
   - Business transactions

2. Means of Communication
   - Oral communication
   - Written communication
   - Visual communication
   - Electronic communication

3. Postal Services
   - Ordinary mail
   - Registered mail
   - Recorded delivery
   - Express mail service
   - Courier services

4. Telecommunications
   - Telephone services
   - Telex and fax
   - Mobile communication
   - Internet services

5. Electronic Communication
   - Email
   - Video conferencing
   - Social media
   - E-commerce platforms

RECOMMENDED TEXTBOOKS:
- Comprehensive Commerce by J.O. Odedokun
- Business Communication by Murphy`,
    difficulty_level: 'beginner',
    estimated_reading_time: 40,
    order_index: 7
  },
  {
    subject: 'commerce',
    topic: 'Advertising',
    subtopic: 'Marketing Communications',
    objectives: [
      'Explain the concept and importance of advertising',
      'Identify different types and media of advertising',
      'Understand advertising agencies',
      'Analyze the advantages and disadvantages of advertising',
      'Explain sales promotion techniques'
    ],
    recommended_content: `TOPICS:
1. Concept of Advertising
   - Definition and objectives
   - Importance in commerce
   - AIDA principle

2. Types of Advertising
   - Informative advertising
   - Persuasive advertising
   - Reminder advertising
   - Competitive advertising

3. Advertising Media
   - Print media (newspapers, magazines)
   - Broadcast media (radio, television)
   - Outdoor advertising
   - Online/digital advertising

4. Advertising Agencies
   - Functions of advertising agencies
   - Types of agencies
   - Advertising Standards

5. Sales Promotion
   - Techniques (discounts, samples, coupons)
   - Trade promotions
   - Personal selling
   - Public relations

RECOMMENDED TEXTBOOKS:
- Essential Commerce by O.A. Longe
- Advertising: Principles and Practice by Wells`,
    difficulty_level: 'beginner',
    estimated_reading_time: 45,
    order_index: 8
  },
  {
    subject: 'commerce',
    topic: 'Warehousing',
    subtopic: 'Storage and Distribution',
    objectives: [
      'Explain the concept and importance of warehousing',
      'Identify different types of warehouses',
      'Understand bonded warehouses',
      'Analyze functions of warehouses',
      'Explain the relationship between warehousing and trade'
    ],
    recommended_content: `TOPICS:
1. Concept of Warehousing
   - Definition and importance
   - Creation of time utility
   - Price stabilization

2. Types of Warehouses
   - Private warehouses
   - Public warehouses
   - Bonded warehouses
   - Cold storage warehouses

3. Bonded Warehouses
   - Purpose and functions
   - Customs regulations
   - Advantages to traders

4. Functions of Warehouses
   - Storage and preservation
   - Price stabilization
   - Risk bearing
   - Financing

5. Warehousing Documentation
   - Warehouse receipt
   - Delivery order
   - Stock records

RECOMMENDED TEXTBOOKS:
- Comprehensive Commerce by J.O. Odedokun
- Logistics and Supply Chain Management by Chopra`,
    difficulty_level: 'intermediate',
    estimated_reading_time: 40,
    order_index: 9
  },
  {
    subject: 'commerce',
    topic: 'Consumer Protection',
    subtopic: 'Rights and Agencies',
    objectives: [
      'Explain the need for consumer protection',
      'Identify consumer rights',
      'Understand consumer protection agencies',
      'Analyze methods of consumer protection',
      'Explain the role of NAFDAC and SON'
    ],
    recommended_content: `TOPICS:
1. Need for Consumer Protection
   - Exploitation by producers
   - Adulteration and fake products
   - Misleading advertising
   - Unfair trade practices

2. Consumer Rights
   - Right to safety
   - Right to be informed
   - Right to choose
   - Right to be heard
   - Right to redress

3. Consumer Protection Agencies
   - Consumer Protection Council (CPC)
   - NAFDAC
   - SON (Standards Organisation of Nigeria)
   - NERC

4. Methods of Consumer Protection
   - Legislation
   - Self-regulation
   - Consumer education
   - Consumer associations

5. Responsibilities of Consumers
   - Reading labels
   - Seeking redress
   - Being ethical

RECOMMENDED TEXTBOOKS:
- Essential Commerce by O.A. Longe
- Consumer Behaviour by Schiffman`,
    difficulty_level: 'beginner',
    estimated_reading_time: 40,
    order_index: 10
  },

  // ACCOUNTING - Complete JAMB Syllabus
  {
    subject: 'accounting',
    topic: 'Introduction to Accounting',
    subtopic: 'Basic Concepts and Principles',
    objectives: [
      'Define accounting and explain its importance',
      'Identify users of accounting information',
      'Understand basic accounting concepts and conventions',
      'Explain the accounting equation',
      'Distinguish between bookkeeping and accounting'
    ],
    recommended_content: `GENERAL AIMS: To understand the fundamental principles and practices of financial accounting.

TOPICS:
1. Definition and Scope of Accounting
   - Meaning of accounting
   - Objectives of accounting
   - Branches of accounting

2. Users of Accounting Information
   - Internal users (management, employees)
   - External users (investors, creditors, government)

3. Accounting Concepts and Conventions
   - Going concern
   - Accrual concept
   - Prudence/Conservatism
   - Consistency
   - Materiality
   - Business entity concept
   - Money measurement concept

4. The Accounting Equation
   - Assets = Liabilities + Capital
   - Effects of transactions on the equation

5. Bookkeeping vs Accounting
   - Recording vs interpreting
   - Clerical vs analytical functions

RECOMMENDED TEXTBOOKS:
- Simplified and Amplified Financial Accounting by S.A. Okwuosa
- Principles of Accounts for West Africa by Frank Wood
- Financial Accounting Made Simple by R.A. Saliu`,
    difficulty_level: 'beginner',
    estimated_reading_time: 45,
    order_index: 1
  },
  {
    subject: 'accounting',
    topic: 'Double Entry System',
    subtopic: 'Recording Transactions',
    objectives: [
      'Explain the double entry principle',
      'Identify debit and credit entries',
      'Prepare ledger accounts',
      'Understand the classification of accounts',
      'Post transactions to appropriate accounts'
    ],
    recommended_content: `TOPICS:
1. Principles of Double Entry
   - Every transaction has two effects
   - Debit and credit rules
   - For every debit, there is a corresponding credit

2. Classification of Accounts
   - Personal accounts
   - Real accounts
   - Nominal accounts

3. Debit and Credit Rules
   - Assets: Debit increases, Credit decreases
   - Liabilities: Credit increases, Debit decreases
   - Capital: Credit increases, Debit decreases
   - Expenses: Debit increases, Credit decreases
   - Income: Credit increases, Debit decreases

4. Ledger Accounts
   - Format of ledger accounts
   - Posting transactions
   - Balancing accounts

5. The Trial Balance
   - Purpose of trial balance
   - Preparation of trial balance
   - Errors not revealed by trial balance

RECOMMENDED TEXTBOOKS:
- Simplified Financial Accounting by S.A. Okwuosa
- Principles of Accounts by Frank Wood`,
    difficulty_level: 'beginner',
    estimated_reading_time: 50,
    order_index: 2
  },
  {
    subject: 'accounting',
    topic: 'Books of Original Entry',
    subtopic: 'Subsidiary Books',
    objectives: [
      'Explain the purpose of books of original entry',
      'Prepare cash book and its types',
      'Record transactions in sales and purchases journals',
      'Understand returns journals',
      'Prepare the journal proper'
    ],
    recommended_content: `TOPICS:
1. Purpose of Subsidiary Books
   - Recording original transactions
   - Source documents
   - Types of subsidiary books

2. Cash Book
   - Single column cash book
   - Two-column cash book (cash and bank)
   - Three-column cash book (with discount)
   - Petty cash book

3. Sales and Purchases Day Books
   - Recording credit sales
   - Recording credit purchases
   - Posting to ledger accounts

4. Returns Books
   - Sales returns (returns inward) journal
   - Purchases returns (returns outward) journal

5. The Journal Proper
   - Purpose and uses
   - Format of journal entries
   - Types of transactions recorded
   - Opening entries, closing entries, corrections

RECOMMENDED TEXTBOOKS:
- Simplified Financial Accounting by S.A. Okwuosa
- Principles of Accounts for SSCE by Ndu`,
    difficulty_level: 'intermediate',
    estimated_reading_time: 55,
    order_index: 3
  },
  {
    subject: 'accounting',
    topic: 'Bank Reconciliation',
    subtopic: 'Cash Book and Bank Statement',
    objectives: [
      'Explain the need for bank reconciliation',
      'Identify causes of differences between cash book and bank statement',
      'Prepare bank reconciliation statement',
      'Update cash book for unrecorded items',
      'Interpret bank reconciliation results'
    ],
    recommended_content: `TOPICS:
1. Need for Bank Reconciliation
   - Differences between cash book and bank statement
   - Internal control purposes
   - Error detection

2. Causes of Differences
   - Timing differences
   - Uncredited deposits
   - Unpresented cheques
   - Bank charges and interest
   - Direct debits and credits
   - Errors in cash book or bank statement

3. Preparation of Bank Reconciliation Statement
   - Starting with cash book balance
   - Starting with bank statement balance
   - Format and presentation

4. Updating the Cash Book
   - Recording previously unrecorded items
   - Correcting errors

5. Interpretation
   - Overdraft situations
   - Favorable balances
   - Action required

RECOMMENDED TEXTBOOKS:
- Principles of Accounts by Frank Wood
- Simplified Financial Accounting by S.A. Okwuosa`,
    difficulty_level: 'intermediate',
    estimated_reading_time: 45,
    order_index: 4
  },
  {
    subject: 'accounting',
    topic: 'Control Accounts',
    subtopic: 'Sales and Purchases Ledger Control',
    objectives: [
      'Explain the purpose of control accounts',
      'Prepare sales ledger control account',
      'Prepare purchases ledger control account',
      'Reconcile control accounts with individual accounts',
      'Identify and correct errors'
    ],
    recommended_content: `TOPICS:
1. Purpose of Control Accounts
   - Summary of individual accounts
   - Internal check and control
   - Detection of errors
   - Preparation of trial balance

2. Sales Ledger Control Account
   - Format and entries
   - Credit sales, receipts, returns
   - Bad debts and discounts
   - Contra entries

3. Purchases Ledger Control Account
   - Format and entries
   - Credit purchases, payments, returns
   - Discounts received
   - Contra entries

4. Reconciliation
   - Comparing control account with list of balances
   - Identifying discrepancies
   - Correcting errors

5. Common Errors
   - Errors of commission
   - Errors of original entry
   - Casting errors

RECOMMENDED TEXTBOOKS:
- Simplified Financial Accounting by S.A. Okwuosa
- Principles of Accounts by Frank Wood`,
    difficulty_level: 'intermediate',
    estimated_reading_time: 50,
    order_index: 5
  },
  {
    subject: 'accounting',
    topic: 'Trading, Profit and Loss Account',
    subtopic: 'Final Accounts - Income Statement',
    objectives: [
      'Explain the purpose of trading account',
      'Calculate cost of goods sold and gross profit',
      'Prepare profit and loss account',
      'Understand adjustments for expenses and income',
      'Calculate net profit or loss'
    ],
    recommended_content: `TOPICS:
1. Trading Account
   - Purpose and format
   - Sales and sales returns
   - Opening and closing stock
   - Purchases and purchases returns
   - Carriage inwards
   - Calculation of cost of goods sold
   - Gross profit or loss

2. Profit and Loss Account
   - Format and purpose
   - Expenses (administrative, selling, financial)
   - Other income
   - Net profit or loss

3. Adjustments
   - Accrued expenses
   - Prepaid expenses
   - Accrued income
   - Income received in advance
   - Depreciation
   - Bad debts and provision for bad debts

4. Combined Trading, Profit and Loss Account
   - Vertical format
   - Presentation

RECOMMENDED TEXTBOOKS:
- Simplified Financial Accounting by S.A. Okwuosa
- Principles of Accounts for West Africa by Frank Wood`,
    difficulty_level: 'intermediate',
    estimated_reading_time: 60,
    order_index: 6
  },
  {
    subject: 'accounting',
    topic: 'Balance Sheet',
    subtopic: 'Statement of Financial Position',
    objectives: [
      'Explain the purpose of balance sheet',
      'Classify assets and liabilities',
      'Prepare balance sheet in proper format',
      'Understand the relationship between P&L and balance sheet',
      'Interpret balance sheet items'
    ],
    recommended_content: `TOPICS:
1. Purpose of Balance Sheet
   - Statement of financial position
   - Shows assets, liabilities and capital
   - Point in time snapshot

2. Classification of Assets
   - Fixed/Non-current assets (tangible and intangible)
   - Current assets
   - Order of permanence or liquidity

3. Classification of Liabilities
   - Long-term/Non-current liabilities
   - Current liabilities

4. Capital and Reserves
   - Capital account
   - Drawings
   - Net profit addition
   - Capital at end of period

5. Balance Sheet Format
   - Horizontal format
   - Vertical format
   - Proper presentation

RECOMMENDED TEXTBOOKS:
- Principles of Accounts by Frank Wood
- Financial Accounting Made Simple by R.A. Saliu`,
    difficulty_level: 'intermediate',
    estimated_reading_time: 55,
    order_index: 7
  },
  {
    subject: 'accounting',
    topic: 'Depreciation',
    subtopic: 'Methods and Accounting Treatment',
    objectives: [
      'Explain the concept and causes of depreciation',
      'Calculate depreciation using different methods',
      'Account for depreciation in books',
      'Understand disposal of assets',
      'Calculate profit or loss on disposal'
    ],
    recommended_content: `TOPICS:
1. Concept of Depreciation
   - Definition
   - Causes (wear and tear, obsolescence, time)
   - Importance of charging depreciation

2. Methods of Depreciation
   - Straight line method
   - Reducing balance method
   - Sum of years digits
   - Revaluation method
   - Machine hour method

3. Accounting for Depreciation
   - Asset account
   - Provision for depreciation account
   - Charge to profit and loss account

4. Disposal of Fixed Assets
   - Recording disposal
   - Calculating profit or loss on disposal
   - Part exchange

5. Revaluation of Assets
   - Reasons for revaluation
   - Accounting treatment

RECOMMENDED TEXTBOOKS:
- Simplified Financial Accounting by S.A. Okwuosa
- Principles of Accounts by Frank Wood`,
    difficulty_level: 'intermediate',
    estimated_reading_time: 50,
    order_index: 8
  },
  {
    subject: 'accounting',
    topic: 'Partnership Accounts',
    subtopic: 'Formation and Dissolution',
    objectives: [
      'Explain the features of partnership',
      'Prepare appropriation account',
      'Understand partners capital and current accounts',
      'Account for goodwill',
      'Prepare dissolution accounts'
    ],
    recommended_content: `TOPICS:
1. Features of Partnership
   - Partnership agreement
   - Profit sharing ratio
   - Interest on capital and drawings
   - Partners salaries

2. Appropriation Account
   - Net profit distribution
   - Interest on capital
   - Interest on drawings
   - Partners salaries
   - Residual profit sharing

3. Capital and Current Accounts
   - Fixed capital method
   - Fluctuating capital method
   - Drawings and interest

4. Goodwill
   - Nature of goodwill
   - Valuation methods
   - Accounting treatment
   - Admission and retirement of partners

5. Dissolution of Partnership
   - Reasons for dissolution
   - Realization account
   - Distribution of assets

RECOMMENDED TEXTBOOKS:
- Principles of Accounts for West Africa by Frank Wood
- Simplified Financial Accounting by S.A. Okwuosa`,
    difficulty_level: 'advanced',
    estimated_reading_time: 65,
    order_index: 9
  },
  {
    subject: 'accounting',
    topic: 'Company Accounts',
    subtopic: 'Share Capital and Final Accounts',
    objectives: [
      'Explain the features of limited liability companies',
      'Understand share capital and types of shares',
      'Prepare company profit and loss appropriation account',
      'Prepare company balance sheet',
      'Understand reserves and provisions'
    ],
    recommended_content: `TOPICS:
1. Features of Limited Companies
   - Separate legal entity
   - Limited liability
   - Share capital structure

2. Share Capital
   - Authorized/nominal capital
   - Issued capital
   - Called-up capital
   - Paid-up capital
   - Types of shares (ordinary, preference)

3. Debentures
   - Difference from shares
   - Types of debentures
   - Interest on debentures

4. Company Final Accounts
   - Profit and loss account
   - Profit and loss appropriation account
   - Dividends (interim and final)
   - Transfer to reserves

5. Company Balance Sheet
   - Format (IAS 1)
   - Reserves (capital and revenue)
   - Provisions

RECOMMENDED TEXTBOOKS:
- Simplified Financial Accounting by S.A. Okwuosa
- Company Accounts by Maurice Pendlebury`,
    difficulty_level: 'advanced',
    estimated_reading_time: 60,
    order_index: 10
  },
  {
    subject: 'accounting',
    topic: 'Manufacturing Accounts',
    subtopic: 'Cost Accounting Basics',
    objectives: [
      'Explain the purpose of manufacturing accounts',
      'Classify manufacturing costs',
      'Prepare manufacturing account',
      'Calculate cost of goods manufactured',
      'Understand work in progress'
    ],
    recommended_content: `TOPICS:
1. Purpose of Manufacturing Account
   - Determining cost of production
   - Distinction from trading account
   - Manufacturing vs trading businesses

2. Classification of Manufacturing Costs
   - Direct materials (raw materials)
   - Direct labor (wages)
   - Direct expenses
   - Prime cost
   - Factory overheads
   - Cost of production

3. Manufacturing Account Format
   - Raw materials consumed
   - Direct labor costs
   - Prime cost
   - Factory overheads
   - Work in progress adjustments
   - Cost of goods manufactured

4. Transfer to Trading Account
   - Cost of goods manufactured
   - Manufacturing profit (if applicable)
   - Market price vs cost

5. Work in Progress
   - Opening and closing WIP
   - Adjustment in manufacturing account

RECOMMENDED TEXTBOOKS:
- Simplified Financial Accounting by S.A. Okwuosa
- Cost Accounting by Horngren`,
    difficulty_level: 'advanced',
    estimated_reading_time: 55,
    order_index: 11
  },
  {
    subject: 'accounting',
    topic: 'Non-Profit Organizations',
    subtopic: 'Clubs and Societies Accounts',
    objectives: [
      'Explain the nature of non-profit organizations',
      'Prepare receipts and payments account',
      'Prepare income and expenditure account',
      'Calculate subscriptions and accumulated fund',
      'Prepare balance sheet for clubs'
    ],
    recommended_content: `TOPICS:
1. Nature of Non-Profit Organizations
   - Objectives (not profit maximization)
   - Types (clubs, societies, charities)
   - Sources of income

2. Receipts and Payments Account
   - Summary of cash transactions
   - Capital and revenue receipts
   - Capital and revenue payments

3. Income and Expenditure Account
   - Accrual basis accounting
   - Revenue items only
   - Surplus or deficit

4. Subscriptions
   - Subscriptions received
   - Subscriptions in arrears
   - Subscriptions in advance
   - Life membership fees

5. Accumulated Fund
   - Opening balance sheet preparation
   - Calculation of accumulated fund
   - Changes during the period

RECOMMENDED TEXTBOOKS:
- Principles of Accounts by Frank Wood
- Simplified Financial Accounting by S.A. Okwuosa`,
    difficulty_level: 'intermediate',
    estimated_reading_time: 50,
    order_index: 12
  },
  {
    subject: 'accounting',
    topic: 'Public Sector Accounting',
    subtopic: 'Government Accounting',
    objectives: [
      'Explain the features of public sector accounting',
      'Understand government budgeting',
      'Explain fund accounting',
      'Understand revenue and expenditure classification',
      'Prepare basic government accounts'
    ],
    recommended_content: `TOPICS:
1. Features of Public Sector Accounting
   - Differences from private sector
   - Cash basis vs accrual basis
   - Accountability and transparency
   - Legal framework

2. Government Budgeting
   - Types of budgets
   - Budget preparation process
   - Budget implementation
   - Budgetary control

3. Fund Accounting
   - Concept of funds
   - Types of funds
   - General fund
   - Special funds

4. Classification of Revenue and Expenditure
   - Recurrent revenue
   - Capital revenue
   - Recurrent expenditure
   - Capital expenditure

5. Government Financial Statements
   - Revenue and expenditure statement
   - Statement of assets and liabilities
   - Cash flow statement

RECOMMENDED TEXTBOOKS:
- Government Accounting by Oshisami
- Public Sector Accounting by Adams`,
    difficulty_level: 'advanced',
    estimated_reading_time: 55,
    order_index: 13
  }
];

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting to seed commercial subjects syllabus...');
    console.log(`Total topics to seed: ${commercialSyllabus.length}`);

    let insertedCount = 0;
    let skippedCount = 0;

    for (const topic of commercialSyllabus) {
      // Check if topic already exists
      const { data: existing } = await supabase
        .from('jamb_syllabus')
        .select('id')
        .eq('subject', topic.subject)
        .eq('topic', topic.topic)
        .maybeSingle();

      if (existing) {
        console.log(`Skipping existing topic: ${topic.subject} - ${topic.topic}`);
        skippedCount++;
        continue;
      }

      const { error } = await supabase
        .from('jamb_syllabus')
        .insert(topic);

      if (error) {
        console.error(`Error inserting ${topic.subject} - ${topic.topic}:`, error);
      } else {
        insertedCount++;
        console.log(`Inserted: ${topic.subject} - ${topic.topic}`);
      }
    }

    // Get final count
    const { count } = await supabase
      .from('jamb_syllabus')
      .select('*', { count: 'exact', head: true });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Commercial syllabus seeding complete`,
        inserted: insertedCount,
        skipped: skippedCount,
        totalTopics: count
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error seeding commercial syllabus:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
