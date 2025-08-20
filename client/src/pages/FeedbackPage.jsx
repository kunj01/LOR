import { useState } from "react";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

export default function FeedbackPage() {
    const { userInfo } = useContext(UserContext);
    const [feedback, setFeedback] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the feedback to your backend
        console.log("Feedback submitted:", feedback);
        setSubmitted(true);
        setFeedback("");
        
        // Reset submitted state after 3 seconds
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="h-full p-6">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    Feedback for Students
                </h1>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Share Your Feedback
                    </h2>
                    
                    <p className="text-gray-600 mb-6">
                        We value your feedback to improve our services. Please share your thoughts, 
                        suggestions, or any issues you've encountered.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                                Your Feedback
                            </label>
                            <textarea
                                id="feedback"
                                rows="6"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Please share your feedback here..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Logged in as: <span className="font-medium">{userInfo?.name || 'User'}</span>
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                Submit Feedback
                            </button>
                        </div>
                    </form>

                    {submitted && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-green-800">
                                Thank you for your feedback! We'll review it and get back to you soon.
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-8 bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Recent Feedback Guidelines
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                        <li>• Be specific and constructive in your feedback</li>
                        <li>• Include examples when possible</li>
                        <li>• Focus on the system and processes</li>
                        <li>• Your feedback will be reviewed by the administration</li>
                    </ul>
                </div>
            </div>
        </div>
    );
} 