# Minibitcoin - Gaming Tournament & Investment Platform

## Project Overview

Minibitcoin is a comprehensive gaming tournament and investment platform that combines competitive gaming with financial earning opportunities. Users can participate in tournaments, manage their wallets, invest in plans, and track earnings in real-time.

## Architecture Overview

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | React 19 + Tailwind 4 | User interface and real-time updates |
| Backend | Express 4 + tRPC 11 | API and business logic |
| Database | MySQL/TiDB | Core data persistence |
| Real-time | Firebase Firestore | Live match updates and notifications |
| Storage | S3-compatible | Images, screenshots, QR codes |
| Image Upload | Cloudinary | User profile pictures and tournament images |
| Auth | Manus OAuth | User authentication |
| Notifications | Built-in Manus API | User notifications |
| Image Generation | Manus LLM | AI-generated promotional content |

### Database Schema

#### Core Tables

**users**
- id (PK)
- openId (Manus OAuth)
- phone (unique, for gaming identity)
- email
- name
- gamingName
- dpUrl (profile picture)
- upiId (for winnings)
- qrUrl (payment QR code)
- balance (wallet)
- totalInvested
- totalProfit
- totalLoss
- role (user/admin)
- createdAt, updatedAt

**tournaments**
- id (PK)
- map (game map)
- type (game mode)
- entryFee
- prizePool
- totalSlots
- joinedCount
- startTime
- status (upcoming/live/completed)
- roomId (game room)
- password (room password)
- details
- createdBy (admin)
- createdAt

**payments**
- id (PK)
- userId (FK)
- tournamentId (FK, optional)
- type (tournament_join/add_fund/withdrawal)
- amount
- utr (transaction reference)
- screenshotUrl
- status (pending/approved/rejected)
- approvedBy (admin)
- rejectedReason
- timestamp

**investments**
- id (PK)
- userId (FK)
- planId
- amount
- roi
- status (active/completed)
- startDate
- endDate
- createdAt

**results**
- id (PK)
- tournamentId (FK)
- winnerId (FK)
- winnerName
- winnerUid
- prizeAmount
- runnerUp
- message
- imageUrl
- likes
- comments
- createdAt

**withdrawals**
- id (PK)
- userId (FK)
- amount
- upiId
- status (pending/approved/rejected)
- processedBy (admin)
- timestamp

## Feature Implementation Plan

### Phase 1: Authentication & Profile Management

**User Registration/Login**
- Phone number based authentication
- Email optional
- Gaming name for tournament display
- Profile picture upload via Cloudinary
- UPI ID management for winnings
- QR code upload for payment

**Profile Dashboard**
- Display wallet balance
- Show total investment, profit, loss statistics
- Edit profile information
- Manage UPI and QR code
- View transaction history

### Phase 2: Wallet System

**Add Fund**
- Request form with amount
- Payment method selection (UPI/Crypto)
- Screenshot upload for verification
- UTR/Transaction ID entry
- Admin approval workflow
- Automatic wallet credit on approval

**Withdrawal**
- Request form with UPI ID
- Amount validation against balance
- Admin approval workflow
- Automatic fund transfer on approval
- Transaction history tracking

**Balance Management**
- Real-time balance updates
- Transaction history with filters
- Pending transaction tracking
- Approved/rejected transaction display

### Phase 3: Tournament System

**Live Tournament Listing**
- Display upcoming tournaments
- Show entry fee, prize pool, slots
- Real-time countdown timers
- Join/leave functionality
- Slot availability tracking
- Map and game mode display

**Tournament Join Flow**
- Payment verification via screenshot
- UTR tracking
- Admin approval workflow
- Room credentials display after approval
- Automatic room ID and password display
- Match start notifications

**Tournament Management**
- Create new tournaments
- Edit tournament details
- Manage room credentials
- Track joined players
- Cancel tournaments if needed

### Phase 4: Payment Verification

**Payment Upload**
- Screenshot upload interface
- UTR/Transaction ID entry
- Payment method selection
- Amount confirmation
- Timestamp recording

**Admin Approval Workflow**
- View pending payments
- Verify screenshot authenticity
- Check UTR validity
- Approve or reject with reason
- Automatic wallet credit on approval
- Notification to user on decision

**Payment History**
- User can view all payments
- Filter by status (pending/approved/rejected)
- Download receipts
- Track payment dates

### Phase 5: Investment Plans

**Investment Tiers**
- Multiple plan options with different ROI
- Minimum and maximum investment amounts
- Lock-in period
- Expected returns display
- Risk level indicators

**Investment Tracking**
- Active investments dashboard
- ROI calculation and display
- Profit/loss tracking
- Investment history
- Maturity date tracking

**Earning History**
- Track all earnings from investments
- Display ROI percentage
- Show profit amounts
- Historical investment records

### Phase 6: Results & Social Features

**Result Publishing**
- Admin uploads match results
- Winner name and UID display
- Prize amount confirmation
- Runner-up display
- Match screenshot
- Custom message from admin

**Winner Notifications**
- Automatic notification on win
- Wallet auto-credit for prize
- Result card display
- Share option for social media

**Social Engagement**
- Like/unlike results
- Comment on results
- View comment history
- User engagement tracking

### Phase 7: Admin Panel

**Dashboard**
- Total users count
- Total balance in system
- Pending approvals count
- Recent activities

**Match Management**
- Create new tournaments
- Edit tournament details
- View joined players
- Upload results
- Manage room credentials

**Payment Management**
- View pending payments
- Approve/reject payments
- View payment history
- Filter by status and type

**User Management**
- Search users by phone
- View user profile
- Edit user balance
- View user transaction history
- Manage user roles

**Withdrawal Management**
- View pending withdrawals
- Approve/reject withdrawals
- Process withdrawals
- View withdrawal history

**Results Management**
- Upload match results
- Edit result details
- View published results
- Delete results if needed

### Phase 8: Real-time Features

**Firebase Integration**
- Real-time match updates
- Live player count updates
- Instant payment status changes
- Real-time notification delivery

**Notifications**
- Payment approved/rejected
- Match starting soon
- User won tournament
- Withdrawal processed
- Investment matured

**Live Updates**
- Tournament slot updates
- Countdown timer sync
- Player join/leave updates
- Admin action notifications

### Phase 9: Storage & CDN

**S3 Integration**
- Payment screenshots storage
- Profile pictures backup
- QR codes storage
- Result images storage
- Tournament thumbnails

**Cloudinary Integration**
- Profile picture upload and optimization
- Image transformation for different sizes
- CDN delivery for fast loading

**URL Management**
- Generate CDN URLs for all images
- Implement image optimization
- Cache management
- Fallback for missing images

### Phase 10: AI Image Generation

**Promotional Content**
- Generate tournament banners
- Create match thumbnails
- Design result cards
- Generate investment plan graphics

**Automation**
- Auto-generate images on tournament creation
- Create result cards when publishing
- Generate promotional content for sharing

## Real-time Synchronization Strategy

**Firebase Listeners**
- Real-time tournament updates
- Live payment status changes
- Instant user notifications
- Live chat/comments on results

**Database Triggers**
- Auto-update tournament slots
- Automatic wallet credit on payment approval
- Automatic prize distribution on result publish

**WebSocket Events** (if needed)
- Real-time countdown updates
- Live player join/leave notifications
- Instant admin action feedback

## Security Considerations

1. **Authentication**: Manus OAuth for secure user authentication
2. **Authorization**: Role-based access control (user/admin)
3. **Payment Verification**: Admin review before wallet credit
4. **Data Encryption**: HTTPS for all communications
5. **Image Validation**: Verify uploaded images before storage
6. **Rate Limiting**: Prevent abuse of payment/withdrawal requests
7. **Audit Logging**: Track all admin actions

## Performance Optimization

1. **Image Optimization**: Compress images on upload
2. **Lazy Loading**: Load tournament cards on scroll
3. **Caching**: Cache user profiles and tournament data
4. **Database Indexing**: Index frequently queried fields
5. **CDN Delivery**: Use S3 CDN for image delivery
6. **Pagination**: Implement pagination for large lists

## Deployment Strategy

1. **Development**: Local development with hot reload
2. **Staging**: Test all features before production
3. **Production**: Deploy to Manus hosting with GitHub Pages
4. **Monitoring**: Track errors and performance metrics
5. **Backup**: Regular database backups

## Success Metrics

- User registration and retention
- Tournament participation rate
- Payment success rate
- Admin approval time
- System uptime and performance
- User engagement (likes, comments)
- Investment plan adoption rate

## Timeline

- Phase 1-2: Week 1 (Auth & Wallet)
- Phase 3-4: Week 2 (Tournaments & Payments)
- Phase 5-6: Week 3 (Investments & Results)
- Phase 7-8: Week 4 (Admin Panel & Real-time)
- Phase 9-10: Week 5 (Storage & AI)
- Phase 11: Week 6 (Testing & Optimization)
- Phase 12: Week 7 (Deployment)

## Next Steps

1. Create database schema in Drizzle
2. Set up Firebase configuration
3. Implement authentication flow
4. Build wallet system
5. Create tournament management
6. Implement payment verification
7. Build admin panel
8. Add real-time features
9. Integrate storage and AI
10. Deploy to production
