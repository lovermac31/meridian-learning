import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertCircle } from 'lucide-react';
import { DEFAULT_LOCALE } from '../i18n/locales';
import { getCurrentLocale } from '../i18n/routing';
import { getUiString } from '../i18n/ui';

interface Props {
  children: ReactNode;
  /** Optional section name shown in the fallback UI */
  sectionName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Generic React Error Boundary.
 * Catches render-time errors in child components and displays
 * a contained fallback instead of crashing the entire application.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `[ErrorBoundary${this.props.sectionName ? `: ${this.props.sectionName}` : ''}]`,
      error,
      errorInfo
    );
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const locale =
        typeof window === 'undefined'
          ? DEFAULT_LOCALE
          : getCurrentLocale();
      const title = this.props.sectionName
        ? `${getUiString(locale, 'errorBoundary.sectionTitlePrefix')} ${this.props.sectionName}`
        : getUiString(locale, 'errorBoundary.title');

      return (
        <section className="py-20 px-6">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-jurassic-dark mb-3">
              {title}
            </h2>
            <p className="text-gray-500 text-sm mb-6 font-light leading-relaxed">
              {getUiString(locale, 'errorBoundary.body')}
            </p>
            <button
              onClick={this.handleRetry}
              className="px-6 py-3 bg-jurassic-accent text-white rounded-full font-bold text-sm hover:bg-opacity-90 transition-all"
            >
              {getUiString(locale, 'errorBoundary.retry')}
            </button>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
