import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { assetsAPI, investmentsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { TrendingUp } from 'lucide-react';

const investmentTypes = [
  { value: 'stocks', label: 'Stocks' },
  { value: 'mutual_funds', label: 'Mutual Funds' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'gold', label: 'Gold' },
  { value: 'fd', label: 'Fixed Deposit' },
  { value: 'bonds', label: 'Bonds' },
];

interface InvestmentFormProps {
  onSuccess: () => void;
  useInvestmentsAPI?: boolean; // Flag to use investmentsAPI instead of assetsAPI
}

export function InvestmentForm({ onSuccess, useInvestmentsAPI = false }: InvestmentFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'mutual_funds',
    investment_amount: '',
    current_value: '',
    purchase_date: '',
    quantity: '',
    unit_price: '',
    expected_return: '',
    risk_level: 'medium',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation: Check required fields exist and are not empty
    if (!formData.name || !formData.investment_amount || !formData.current_value) {
      toast.error('Please fill in all required fields (Name, Investment Amount, Current Value)');
      return;
    }

    // Parse and validate numeric values
    const investmentAmount = parseFloat(formData.investment_amount);
    const currentValue = parseFloat(formData.current_value);

    // Check if parsed values are valid numbers
    if (isNaN(investmentAmount) || isNaN(currentValue)) {
      toast.error('Investment Amount and Current Value must be valid numbers');
      return;
    }

    // Check if values are positive
    if (investmentAmount <= 0 || currentValue <= 0) {
      toast.error('Investment Amount and Current Value must be greater than 0');
      return;
    }

    // Optional fields validation
    let quantity = null;
    let purchasePrice = null;
    let expectedReturn = null;

    if (formData.quantity) {
      quantity = parseFloat(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        toast.error('Quantity must be a valid positive number');
        return;
      }
    }

    if (formData.unit_price) {
      purchasePrice = parseFloat(formData.unit_price);
      if (isNaN(purchasePrice) || purchasePrice <= 0) {
        toast.error('Unit Price must be a valid positive number');
        return;
      }
    }

    if (formData.expected_return) {
      expectedReturn = parseFloat(formData.expected_return);
      if (isNaN(expectedReturn)) {
        toast.error('Expected Return must be a valid number');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Calculate gain/loss
      const gainLoss = currentValue - investmentAmount;
      const gainLossPercent = (gainLoss / investmentAmount) * 100;

      const investmentData = {
        name: formData.name.trim(),
        type: formData.type,
        amount: investmentAmount,
        currentValue: currentValue,
        purchaseDate: formData.purchase_date || null,
        quantity: quantity,
        purchasePrice: purchasePrice,
        returns: expectedReturn,
        notes: `Risk: ${formData.risk_level}${formData.notes ? ' | ' + formData.notes.trim() : ''}`,
      };

      // Use the appropriate API based on the flag
      if (useInvestmentsAPI) {
        await investmentsAPI.create(investmentData);
      } else {
        // For assetsAPI, use different field names
        await assetsAPI.create({
          name: formData.name.trim(),
          type: formData.type,
          purchase_value: investmentAmount,
          current_value: currentValue,
          purchase_date: formData.purchase_date || null,
          notes: `Investment | Risk: ${formData.risk_level} | Expected Return: ${expectedReturn ? expectedReturn.toFixed(2) : '0'}% | Gain/Loss: ${gainLossPercent.toFixed(2)}%${formData.notes ? ' | ' + formData.notes.trim() : ''}`,
        });
      }

      toast.success(`Investment added! Gain/Loss: ₹${gainLoss.toFixed(2)} (${gainLossPercent.toFixed(2)}%)`);
      setFormData({
        name: '',
        type: 'mutual_funds',
        investment_amount: '',
        current_value: '',
        purchase_date: '',
        quantity: '',
        unit_price: '',
        expected_return: '',
        risk_level: 'medium',
        notes: '',
      });
      onSuccess();
    } catch (error) {
      console.error('Error adding investment:', error);
      toast.error('Failed to add investment');
    }

    setIsSubmitting(false);
  };

  const investmentAmount = formData.investment_amount ? parseFloat(formData.investment_amount) : 0;
  const currentValue = formData.current_value ? parseFloat(formData.current_value) : 0;
  const gainLoss = !isNaN(investmentAmount) && !isNaN(currentValue) ? currentValue - investmentAmount : 0;
  const gainLossPercent = !isNaN(investmentAmount) && investmentAmount > 0 ? (gainLoss / investmentAmount) * 100 : 0;
  
  // Validation state checks
  const isInvestmentAmountValid = !formData.investment_amount || (investmentAmount > 0 && !isNaN(investmentAmount));
  const isCurrentValueValid = !formData.current_value || (currentValue > 0 && !isNaN(currentValue));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Investment Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Axis Growth Fund"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Investment Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {investmentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="risk_level">Risk Level</Label>
          <Select
            value={formData.risk_level}
            onValueChange={(value) => setFormData({ ...formData, risk_level: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="investment_amount">Investment Amount (₹) *</Label>
          <Input
            id="investment_amount"
            type="number"
            step="0.01"
            value={formData.investment_amount}
            onChange={(e) => setFormData({ ...formData, investment_amount: e.target.value })}
            placeholder="0.00"
            className={!isInvestmentAmountValid ? 'border-red-500' : ''}
          />
          {!isInvestmentAmountValid && (
            <p className="text-xs text-red-500">Must be a positive number</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="current_value">Current Value (₹) *</Label>
          <Input
            id="current_value"
            type="number"
            step="0.01"
            value={formData.current_value}
            onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
            placeholder="0.00"
            className={!isCurrentValueValid ? 'border-red-500' : ''}
          />
          {!isCurrentValueValid && (
            <p className="text-xs text-red-500">Must be a positive number</p>
          )}
        </div>
      </div>

      {investmentAmount > 0 && currentValue > 0 && !isNaN(gainLoss) && !isNaN(gainLossPercent) && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-900">Performance Summary</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-blue-600">Gain/Loss</p>
              <p className={`font-semibold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{gainLoss.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-blue-600">Return %</p>
              <p className={`font-semibold ${gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {gainLossPercent.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-blue-600">Current Val</p>
              <p className="font-semibold text-blue-900">₹{currentValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="purchase_date">Purchase Date</Label>
          <Input
            id="purchase_date"
            type="date"
            value={formData.purchase_date}
            onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expected_return">Expected Return (%)</Label>
          <Input
            id="expected_return"
            type="number"
            step="0.01"
            value={formData.expected_return}
            onChange={(e) => setFormData({ ...formData, expected_return: e.target.value })}
            placeholder="e.g., 12.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity (Units/Shares)</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            placeholder="e.g., 100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit_price">Unit Price (₹)</Label>
          <Input
            id="unit_price"
            type="number"
            step="0.01"
            value={formData.unit_price}
            onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
            placeholder="e.g., 1000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Investment strategy, portfolio allocation, etc."
          rows={2}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Adding Investment...' : 'Add Investment'}
      </Button>
    </form>
  );
}
