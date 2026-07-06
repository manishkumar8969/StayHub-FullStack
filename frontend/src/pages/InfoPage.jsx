import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const InfoPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // URL path ke hisab se Title aur Content setup karna
    const getPageContent = (path) => {
        switch(path) {
            case '/help-center':
                return { title: "Help Center", desc: "Welcome to StayHub Support. How can we help you today? Check booking status, refund issues, or cancel stays here." };
            case '/aircover':
                return { title: "AirCover Protection", desc: "StayHub provides AirCover for every booking. Complete protection against host cancellations, listing inaccuracies, and check-in issues." };
            case '/anti-discrimination':
                return { title: "Anti-Discrimination Policy", desc: "StayHub is built on respect and inclusion. We strictly prohibit discrimination based on race, religion, gender, or orientation." };
            case '/host-home':
                return { title: "List Your Property on StayHub", desc: "Earn extra money by welcoming guests into your space. It's safe, free to list, and fully covered under host protection plans." };
            case '/hosting-resources':
                return { title: "Hosting Resources & Tips", desc: "Learn how to be an amazing 5-star host. Tips on interior design, hosting etiquette, price management, and guest satisfaction." };
            case '/community-forum':
                return { title: "Community Forum", desc: "Connect with other global hosts and travelers on StayHub. Share travel stories, local advice, and hosting ideas." };
            case '/newsroom':
                return { title: "StayHub Newsroom", desc: "Stay up-to-date with company announcements, press releases, new product features, and community stories for 2026." };
            case '/careers':
                return { title: "Careers at StayHub", desc: "Join our remote engineering and design teams! Explore opportunities in full-stack development, cloud infrastructure, and product management." };
            case '/investors':
                return { title: "Investor Relations", desc: "StayHub financial reports, stock updates, quarterly performance metrics, and governance charts for our venture backers." };
            case '/privacy':
                return { title: "Privacy Policy", desc: "We protect your personal data. Learn how your location history, booking choices, and payment options are securely encrypted." };
            case '/terms':
                return { title: "Terms of Service", desc: "Read our rules, guidelines, cancellation frameworks, and user agreements required to participate in the StayHub platform." };
            default:
                return { title: "StayHub Information Page", desc: "This informational page is under review or being structured." };
        }
    };

    const content = getPageContent(location.pathname);

    return (
        <div className="container mt-5 mb-5 pt-5 pb-5">
            <div className="row justify-content-center">
                <div className="col-md-8 text-center p-5 bg-white shadow rounded-4">
                    <h1 className="fw-bold text-danger mb-4">{content.title}</h1>
                    <hr className="w-25 mx-auto" />
                    <p className="text-secondary fs-5 mt-4 leading-relaxed">{content.desc}</p>
                    <button className="btn btn-dark rounded-pill px-4 py-2 mt-5 fw-bold" onClick={() => navigate('/')}>
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoPage;