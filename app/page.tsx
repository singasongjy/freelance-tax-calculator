"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FilingStatus = "single" | "married-jointly" | "married-separately" | "head-of-household"

type StateInfo = {
  value: string
  label: string
  rate: number
}

const STATES: StateInfo[] = [
  { value: "CA", label: "California", rate: 0.093 },
  { value: "NY", label: "New York", rate: 0.0685 },
  { value: "TX", label: "Texas", rate: 0 },
  { value: "FL", label: "Florida", rate: 0 },
  { value: "WA", label: "Washington", rate: 0 },
  { value: "IL", label: "Illinois", rate: 0.0495 },
  { value: "PA", label: "Pennsylvania", rate: 0.0307 },
  { value: "OH", label: "Ohio", rate: 0.035 },
  { value: "GA", label: "Georgia", rate: 0.0575 },
  { value: "NC", label: "North Carolina", rate: 0.045 },
]

// 2025 Federal Tax Brackets
const TAX_BRACKETS = {
  single: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11926, max: 48475, rate: 0.12 },
    { min: 48476, max: 103350, rate: 0.22 },
    { min: 103351, max: 197300, rate: 0.24 },
    { min: 197301, max: 250525, rate: 0.32 },
    { min: 250526, max: 626350, rate: 0.35 },
    { min: 626351, max: Infinity, rate: 0.37 },
  ],
  "married-jointly": [
    { min: 0, max: 23850, rate: 0.10 },
    { min: 23851, max: 96950, rate: 0.12 },
    { min: 96951, max: 206700, rate: 0.22 },
    { min: 206701, max: 394600, rate: 0.24 },
    { min: 394601, max: 501050, rate: 0.32 },
    { min: 501051, max: 1252700, rate: 0.35 },
    { min: 1252701, max: Infinity, rate: 0.37 },
  ],
  "married-separately": [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11926, max: 48475, rate: 0.12 },
    { min: 48476, max: 103350, rate: 0.22 },
    { min: 103351, max: 197300, rate: 0.24 },
    { min: 197301, max: 250525, rate: 0.32 },
    { min: 250526, max: 626350, rate: 0.35 },
    { min: 626351, max: Infinity, rate: 0.37 },
  ],
  "head-of-household": [
    { min: 0, max: 17050, rate: 0.10 },
    { min: 17051, max: 64850, rate: 0.12 },
    { min: 64851, max: 103350, rate: 0.22 },
    { min: 103351, max: 197300, rate: 0.24 },
    { min: 197301, max: 250525, rate: 0.32 },
    { min: 250526, max: 626350, rate: 0.35 },
    { min: 626351, max: Infinity, rate: 0.37 },
  ],
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, "")
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : Math.max(0, parsed)
}

function formatCurrencyInput(value: string): string {
  // Remove all non-numeric characters (including commas)
  const numericOnly = value.replace(/[^0-9]/g, "")
  
  // If empty, return empty string
  if (numericOnly === "") return ""
  
  // Convert to number and format with commas
  const number = parseInt(numericOnly, 10)
  if (isNaN(number)) return ""
  
  // Format with commas using Intl.NumberFormat
  return new Intl.NumberFormat("en-US").format(number)
}

function calculateFederalTax(income: number, filingStatus: FilingStatus): number {
  const brackets = TAX_BRACKETS[filingStatus]
  let tax = 0
  let previousBracketMax = -1

  for (const bracket of brackets) {
    const bracketMax = bracket.max === Infinity ? income : bracket.max
    const bracketStart = previousBracketMax + 1
    const bracketEnd = bracketMax

    if (income > previousBracketMax) {
      const actualIncomeInBracket = previousBracketMax === -1
        ? Math.min(income, bracketEnd) - bracketStart
        : Math.min(income, bracketEnd) - previousBracketMax

      if (actualIncomeInBracket > 0) {
        tax += actualIncomeInBracket * bracket.rate
      }
    }

    previousBracketMax = bracketMax
  }

  return Math.round(tax * 100) / 100
}

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [displayValue, setDisplayValue] = useState(value)
  const prevValueRef = useRef(value)

  useEffect(() => {
    if (value !== prevValueRef.current) {
      const startValue = prevValueRef.current
      const endValue = value
      const duration = 500
      const startTime = Date.now()

      const animate = () => {
        const now = Date.now()
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3)

        const currentValue = startValue + (endValue - startValue) * easeOut
        setDisplayValue(currentValue)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setDisplayValue(endValue)
        }
      }

      requestAnimationFrame(animate)
      prevValueRef.current = value
    }
  }, [value])

  return <span className={className}>{formatCurrency(displayValue)}</span>
}

function AnimatedPercentage({ value, className }: { value: number; className?: string }) {
  const [displayValue, setDisplayValue] = useState(value)
  const prevValueRef = useRef(value)

  useEffect(() => {
    if (value !== prevValueRef.current) {
      const startValue = prevValueRef.current
      const endValue = value
      const duration = 500
      const startTime = Date.now()

      const animate = () => {
        const now = Date.now()
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)

        const easeOut = 1 - Math.pow(1 - progress, 3)
        const currentValue = startValue + (endValue - startValue) * easeOut
        setDisplayValue(currentValue)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setDisplayValue(endValue)
        }
      }

      requestAnimationFrame(animate)
      prevValueRef.current = value
    }
  }, [value])

  return <span className={className}>{displayValue.toFixed(2)}%</span>
}

export default function Home() {
  const [grossIncome, setGrossIncome] = useState<string>("")
  const [businessExpenses, setBusinessExpenses] = useState<string>("")
  const [state, setState] = useState<string>("CA")
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single")

  const calculations = useMemo(() => {
    const gross = parseCurrency(grossIncome)
    const expenses = parseCurrency(businessExpenses)
    const netIncome = Math.max(0, gross - expenses)

    if (netIncome <= 0) {
      return {
        netIncome: 0,
        selfEmploymentTax: 0,
        seTaxDeduction: 0,
        taxableIncome: 0,
        federalTax: 0,
        stateTax: 0,
        totalTax: 0,
        quarterlyPayments: 0,
        effectiveRate: 0,
        takeHome: 0,
      }
    }

    // Step 1: Calculate self-employment tax (15.3% on 92.35% of net income)
    const selfEmploymentTaxable = netIncome * 0.9235
    const selfEmploymentTax = Math.round(selfEmploymentTaxable * 0.153 * 100) / 100

    // Step 2: Calculate deduction (50% of self-employment tax)
    const seTaxDeduction = Math.round(selfEmploymentTax * 0.5 * 100) / 100

    // Step 3: Calculate taxable income (net income minus SE tax deduction)
    const taxableIncome = Math.max(0, netIncome - seTaxDeduction)

    // Step 4: Calculate federal income tax on taxable income
    const federalTax = calculateFederalTax(taxableIncome, filingStatus)

    // Step 5: Calculate state income tax on net income
    const stateInfo = STATES.find((s) => s.value === state)
    const stateRate = stateInfo?.rate || 0
    const stateTax = Math.round(netIncome * stateRate * 100) / 100

    // Step 6: Total tax liability
    const totalTax = Math.round((selfEmploymentTax + federalTax + stateTax) * 100) / 100

    // Step 7: Quarterly payments
    const quarterlyPayments = Math.round((totalTax / 4) * 100) / 100

    // Step 8: Effective tax rate
    const effectiveRate = gross > 0 ? (totalTax / gross) * 100 : 0

    // Step 9: Take-home income
    const takeHome = Math.round((gross - expenses - totalTax) * 100) / 100

    return {
      netIncome: Math.round(netIncome * 100) / 100,
      selfEmploymentTax,
      seTaxDeduction,
      taxableIncome: Math.round(taxableIncome * 100) / 100,
      federalTax,
      stateTax,
      totalTax,
      quarterlyPayments,
      effectiveRate,
      takeHome,
    }
  }, [grossIncome, businessExpenses, state, filingStatus])

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
              2025 Tax Year
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">US Freelance Tax Calculator 2025</h1>
          <p className="text-lg sm:text-xl text-blue-100 mb-2">
            Estimate your self-employment taxes for tax year 2025
          </p>
          <p className="text-sm sm:text-base text-blue-200 max-w-3xl mx-auto">
            Calculate your estimated federal and state taxes as a freelance worker or independent
            contractor. This calculator uses the 2025 IRS tax brackets and includes
            self-employment tax.
          </p>
        </div>
      </div>

      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Card */}
            <Card>
              <CardHeader>
                <CardTitle>Tax Information</CardTitle>
                <CardDescription>Enter your income and filing details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="gross-income">Annual Gross Income</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="gross-income"
                      type="text"
                      placeholder="100,000"
                      value={grossIncome}
                      onChange={(e) => {
                        const formatted = formatCurrencyInput(e.target.value)
                        setGrossIncome(formatted)
                      }}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expenses">Business Expenses</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="expenses"
                      type="text"
                      placeholder="10,000"
                      value={businessExpenses}
                      onChange={(e) => {
                        const formatted = formatCurrencyInput(e.target.value)
                        setBusinessExpenses(formatted)
                      }}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger id="state" className="w-full">
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filing-status">Filing Status</Label>
                  <Select
                    value={filingStatus}
                    onValueChange={(value) => setFilingStatus(value as FilingStatus)}
                  >
                    <SelectTrigger id="filing-status" className="w-full">
                      <SelectValue placeholder="Select filing status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married-jointly">Married Filing Jointly</SelectItem>
                      <SelectItem value="married-separately">Married Filing Separately</SelectItem>
                      <SelectItem value="head-of-household">Head of Household</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results Card */}
            <Card>
              <CardHeader>
                <CardTitle>Tax Breakdown</CardTitle>
                <CardDescription>Your estimated tax calculations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Net Business Income</span>
                    <span className="text-sm font-semibold">
                      <AnimatedNumber value={calculations.netIncome} />
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Self-Employment Tax</span>
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                      <AnimatedNumber value={calculations.selfEmploymentTax} />
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-muted-foreground">
                      SE Tax Deduction (50%)
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground">
                      -<AnimatedNumber value={calculations.seTaxDeduction} />
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Taxable Income (for Federal)</span>
                    <span className="text-sm font-semibold">
                      <AnimatedNumber value={calculations.taxableIncome} />
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Federal Income Tax</span>
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                      <AnimatedNumber value={calculations.federalTax} />
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">State Income Tax</span>
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                      <AnimatedNumber value={calculations.stateTax} />
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-t-2 border-b-2 mt-2">
                    <span className="text-base font-semibold">Total Estimated Tax Liability</span>
                    <span className="text-base font-bold text-red-600 dark:text-red-400">
                      <AnimatedNumber value={calculations.totalTax} />
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Quarterly Estimated Payments</span>
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                      <AnimatedNumber value={calculations.quarterlyPayments} />
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Effective Tax Rate</span>
                    <span className="text-sm font-semibold">
                      <AnimatedPercentage value={calculations.effectiveRate} />
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-t-2 mt-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg px-4">
                    <span className="text-base font-semibold">Estimated Take-Home Income</span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      <AnimatedNumber value={calculations.takeHome} />
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SEO Content Sections */}
          <div className="max-w-4xl mx-auto mt-16 space-y-16">
            {/* How It Works Section */}
            <section>
              <h2 className="text-3xl font-bold mb-6">How the Freelance Tax Calculator Works</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  As a freelancer or independent contractor, you&apos;re responsible for paying
                  self-employment tax, which covers your Social Security and Medicare contributions.
                  The self-employment tax rate is 15.3% and is calculated on 92.35% of your net
                  business income (your gross income minus deductible business expenses). This tax
                  is separate from your regular income tax and is one of the most important
                  considerations for freelancers when planning their finances.
                </p>
                <p>
                  Federal income tax is calculated using progressive tax brackets that vary based on
                  your filing status (Single, Married Filing Jointly, etc.). The 2025 tax brackets
                  range from 10% for the lowest income levels up to 37% for the highest earners. Our
                  calculator applies these brackets correctly, ensuring that only the income within
                  each bracket is taxed at that bracket&apos;s rate. Importantly, you can deduct
                  50% of your self-employment tax from your taxable income before calculating
                  federal income tax, which helps reduce your overall tax burden.
                </p>
                <p>
                  Unlike traditional employees who have taxes withheld from each paycheck, freelancers
                  must make quarterly estimated tax payments throughout the year. These payments are
                  typically due on April 15, June 15, September 15, and January 15 of the following
                  year. Each quarterly payment should be approximately one-fourth of your total
                  estimated annual tax liability. Failing to make these payments or underpaying can
                  result in penalties from the IRS, so it&apos;s crucial to estimate your taxes
                  accurately.
                </p>
                <p>
                  State tax considerations add another layer of complexity for freelancers. State
                  income tax rates vary significantly across the United States, with some states
                  like Texas, Florida, and Washington having no state income tax at all. Other
                  states like California and New York have relatively high state tax rates. Our
                  calculator accounts for state-specific tax rates, helping you understand your total
                  tax liability including both federal and state taxes. This comprehensive view is
                  essential for accurate financial planning and ensuring you set aside enough money
                  for your tax obligations.
                </p>
              </div>
            </section>

            {/* Why Use This Calculator Section */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Why Use Our Tax Calculator?</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-bold">✓</span>
                  <span>
                    <strong className="text-foreground">Accurate 2025 tax rates:</strong> Our
                    calculator uses the latest 2025 IRS tax brackets and self-employment tax rates,
                    ensuring you get the most current and accurate estimates for your tax planning.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-bold">✓</span>
                  <span>
                    <strong className="text-foreground">Real-time calculations:</strong> See your tax
                    estimates update instantly as you enter your income and expenses. No need to
                    submit forms or wait for results—everything calculates automatically.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-bold">✓</span>
                  <span>
                    <strong className="text-foreground">State-specific estimates:</strong> Get
                    accurate state tax calculations based on where you live. We support major US
                    states with their specific tax rates, so you know exactly what to expect.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-bold">✓</span>
                  <span>
                    <strong className="text-foreground">Free to use:</strong> Our freelance tax
                    calculator is completely free with no hidden fees or premium features. Get
                    professional-grade tax estimates without spending a dime.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-bold">✓</span>
                  <span>
                    <strong className="text-foreground">No signup required:</strong> Start
                    calculating your taxes immediately without creating an account or providing any
                    personal information. Your privacy is important to us.
                  </span>
                </li>
              </ul>
            </section>

            {/* FAQ Section */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    How much tax do freelancers pay?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Freelancers typically pay between 25-35% of their net income in taxes,
                    depending on their income level and state of residence. This includes
                    self-employment tax (15.3% on 92.35% of net income), federal income tax
                    (ranging from 10% to 37% based on progressive brackets), and state income tax
                    (varies by state, with some states having no income tax). The exact percentage
                    depends on your total income, filing status, and location.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    When are quarterly taxes due in 2025?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Quarterly estimated tax payments for 2025 are due on April 15, 2025 (Q1),
                    June 16, 2025 (Q2), September 15, 2025 (Q3), and January 15, 2026 (Q4). Note
                    that if a due date falls on a weekend or holiday, the deadline moves to the next
                    business day. It&apos;s important to make these payments on time to avoid
                    penalties and interest charges from the IRS.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    What expenses can I deduct?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    As a freelancer, you can deduct ordinary and necessary business expenses that
                    help you earn income. Common deductible expenses include home office costs,
                    equipment and software, internet and phone bills (business portion), travel
                    expenses, professional development and training, marketing and advertising,
                    professional services (accountants, lawyers), and business insurance. Keep
                    detailed records and receipts for all business expenses to support your
                    deductions.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Do I need to pay state taxes?</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Whether you need to pay state income tax depends on where you live and work.
                    Some states like Texas, Florida, Washington, Nevada, and New Hampshire have no
                    state income tax. However, most states do require freelancers to pay state
                    income tax on their earnings. Additionally, if you work in multiple states, you
                    may need to file tax returns in each state where you earned income. Our
                    calculator helps you estimate state taxes based on your primary state of
                    residence.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    How accurate is this calculator?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our calculator provides accurate estimates based on the 2025 IRS tax brackets
                    and self-employment tax rates. However, it&apos;s designed for estimation
                    purposes and doesn&apos;t account for all possible deductions, credits, or
                    special circumstances that might apply to your specific situation. For the most
                    accurate tax planning, especially if you have complex finances, multiple income
                    sources, or significant deductions, we recommend consulting with a qualified tax
                    professional.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    What&apos;s the difference between 1099 and W-2?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    The main difference is how taxes are handled. W-2 employees have taxes
                    automatically withheld from their paychecks by their employer, and the employer
                    pays half of their Social Security and Medicare taxes. 1099 independent
                    contractors (freelancers) receive their full payment without any tax
                    withholding and are responsible for paying all taxes themselves, including the
                    full 15.3% self-employment tax. 1099 workers also have more flexibility in
                    deducting business expenses but must make quarterly estimated tax payments
                    throughout the year.
                  </p>
                </div>
              </div>
            </section>

            {/* Tax Tips Section */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Tax-Saving Tips for Freelancers</h2>
              <ol className="space-y-4 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-bold text-lg">1.</span>
                  <div>
                    <strong className="text-foreground">Maximize your business expense deductions.</strong>{" "}
                    Keep detailed records of all business-related expenses throughout the year,
                    including home office costs, equipment, software subscriptions, and professional
                    development. Every legitimate business expense reduces your taxable income and
                    lowers your tax bill.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-bold text-lg">2.</span>
                  <div>
                    <strong className="text-foreground">Make quarterly estimated tax payments on time.</strong>{" "}
                    Set aside money from each payment you receive and make your quarterly estimated
                    tax payments by the deadlines to avoid penalties and interest. Consider opening
                    a separate savings account specifically for taxes to make this easier.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-bold text-lg">3.</span>
                  <div>
                    <strong className="text-foreground">Contribute to retirement accounts.</strong>{" "}
                    Contributions to SEP-IRA, Solo 401(k), or traditional IRA accounts are
                    tax-deductible and reduce your taxable income. This not only helps you save for
                    retirement but also lowers your current year tax liability significantly.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-bold text-lg">4.</span>
                  <div>
                    <strong className="text-foreground">Track your mileage and travel expenses.</strong>{" "}
                    If you travel for business, keep a detailed log of business miles driven and
                    save receipts for business meals, lodging, and other travel expenses. These can
                    add up to substantial deductions, especially if you frequently meet clients or
                    attend industry events.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-bold text-lg">5.</span>
                  <div>
                    <strong className="text-foreground">Consider timing your income and expenses.</strong>{" "}
                    If possible, time large business expenses for the end of the year to maximize
                    deductions, or defer income to the next year if you&apos;re in a higher tax
                    bracket. However, always consult with a tax professional before making
                    significant timing decisions.
                  </div>
                </li>
              </ol>
            </section>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Disclaimer:</strong> This calculator provides estimates only. Consult a tax
              professional for accurate tax advice. Tax brackets based on 2025 IRS guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
