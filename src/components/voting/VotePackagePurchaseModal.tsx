// Vote Package Purchase Modal - Buy vote bundles
import React, { useState } from 'react';
import { VotePackage } from '../../types/voting';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import {
  X,
  Package,
  Sparkles,
  CreditCard,
  Smartphone,
  Check,
  Gift,
  ArrowRight,
} from 'lucide-react';

interface VotePackagePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: VotePackage[];
  onPurchase: (packageData: VotePackage) => Promise<void>;
  currency: string;
}

export const VotePackagePurchaseModal: React.FC<VotePackagePurchaseModalProps> = ({
  isOpen,
  onClose,
  packages,
  onPurchase,
  currency,
}) => {
  const [selectedPackage, setSelectedPackage] = useState<VotePackage | null>(null);
  const [step, setStep] = useState<'select' | 'payment' | 'success'>('select');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'ussd'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    
    setIsProcessing(true);
    try {
      await onPurchase(selectedPackage);
      setStep('success');
    } catch (error) {
      console.error('Failed to purchase:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep('select');
    setSelectedPackage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {step === 'success' ? 'Purchase Complete!' : 'Buy Vote Package'}
              </h2>
              <p className="text-sm text-white/50">
                {step === 'select' && 'Choose a package'}
                {step === 'payment' && 'Complete your payment'}
                {step === 'success' && 'Your votes are ready'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[60vh]">
          {/* Package Selection */}
          {step === 'select' && (
            <div className="space-y-3">
              {packages.filter(p => p.isActive).map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={cn(
                    'w-full p-4 rounded-xl border-2 text-left transition-all relative',
                    selectedPackage?.id === pkg.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10">
                        <Gift className="w-6 h-6 text-white/60" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{pkg.name}</p>
                        <p className="text-sm text-white/50">
                          {pkg.voteCount} votes
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(pkg.price)}
                      </p>
                      {pkg.discountPercentage && pkg.discountPercentage > 0 && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                          Save {pkg.discountPercentage}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Price per vote */}
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <span className="text-xs text-white/40">
                      {formatCurrency(pkg.price / pkg.voteCount)} per vote
                    </span>
                  </div>

                  {/* Selection Indicator */}
                  {selectedPackage?.id === pkg.id && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}

              {packages.filter(p => p.isActive).length === 0 && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-white/30 mb-3" />
                  <p className="text-white/50">No packages available</p>
                </div>
              )}
            </div>
          )}

          {/* Payment Step */}
          {step === 'payment' && selectedPackage && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-sm text-white/50 mb-2">Order Summary</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{selectedPackage.name}</p>
                    <p className="text-sm text-white/50">{selectedPackage.voteCount} votes</p>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {formatCurrency(selectedPackage.price)}
                  </p>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <p className="text-sm font-medium text-white/70 mb-3">Payment Method</p>
                <div className="space-y-2">
                  {[
                    { id: 'card', label: 'Card Payment', icon: CreditCard, desc: 'Visa, Mastercard, Verve' },
                    { id: 'transfer', label: 'Bank Transfer', icon: Smartphone, desc: 'Instant transfer' },
                    { id: 'ussd', label: 'USSD', icon: Smartphone, desc: 'Dial *bank# code' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as typeof paymentMethod)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
                        paymentMethod === method.id
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-white/10 hover:border-white/20'
                      )}
                    >
                      <method.icon className="w-5 h-5 text-white/60" />
                      <div className="text-left flex-1">
                        <p className="font-medium text-white">{method.label}</p>
                        <p className="text-xs text-white/40">{method.desc}</p>
                      </div>
                      {paymentMethod === method.id && (
                        <Check className="w-5 h-5 text-indigo-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && selectedPackage && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Payment Successful!</h3>
              <p className="text-white/60 mb-6">
                You've purchased {selectedPackage.voteCount} votes for{' '}
                {formatCurrency(selectedPackage.price)}
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="font-semibold text-white">
                  +{selectedPackage.voteCount} votes added to your balance
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 bg-black/20">
          {step === 'select' && (
            <Button
              onClick={() => setStep('payment')}
              disabled={!selectedPackage}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white gap-2 py-3 disabled:opacity-50"
            >
              Continue to Payment
              <ArrowRight className="w-5 h-5" />
            </Button>
          )}

          {step === 'payment' && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('select')}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Back
              </Button>
              <Button
                onClick={handlePurchase}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay {formatCurrency(selectedPackage?.price || 0)}
                  </>
                )}
              </Button>
            </div>
          )}

          {step === 'success' && (
            <Button
              onClick={handleClose}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Start Voting
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
